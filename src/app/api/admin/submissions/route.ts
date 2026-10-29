import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function getSupabaseServerClient(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = getSupabaseServerClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let { data, error } = await supabase
      .from("submissions")
      .select("*, submission_tags(tag:tags(id, name, slug, is_preset))")
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback query without relational tags in case junction table is not yet created
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackError) {
        const { data: simpleData, error: simpleError } = await supabase
          .from("submissions")
          .select("*");

        if (simpleError) {
          return NextResponse.json({ error: simpleError.message }, { status: 500 });
        }
        data = simpleData;
      } else {
        data = fallbackData;
      }
    }

    return NextResponse.json({
      data: data || [],
      user: user?.email || null,
      authenticated: !!user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase } = getSupabaseServerClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { id, title, author, category, language, body: contentBody, status, is_published, email, instagram, tags } = body;

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {};
    if (title !== undefined) updatePayload.title = title;
    if (author !== undefined) updatePayload.author = author;
    if (category !== undefined) updatePayload.category = category;
    if (language !== undefined) updatePayload.language = language.toLowerCase().trim();
    if (contentBody !== undefined) updatePayload.body = contentBody;
    if (email !== undefined) updatePayload.email = email || "";
    if (instagram !== undefined) updatePayload.instagram = instagram || "";
    if (status !== undefined) updatePayload.status = status;
    if (is_published !== undefined) updatePayload.is_published = is_published;

    // Update submissions table
    let { data: updatedSub, error: updateError } = await supabase
      .from("submissions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) {
      // Fallback if status column is not yet migrated
      if (updateError.message?.toLowerCase().includes("status")) {
        delete updatePayload.status;
        const retry = await supabase
          .from("submissions")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .maybeSingle();
        updateError = retry.error;
        updatedSub = retry.data;
      }
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    // Handle tags update if tags array is provided
    if (Array.isArray(tags)) {
      try {
        // Clear existing junction links for this submission
        await supabase
          .from("submission_tags")
          .delete()
          .eq("submission_id", id);

        const linksToInsert: { submission_id: string; tag_id: string }[] = [];

        for (const tag of tags) {
          let tagId = tag.id;
          const tagName = typeof tag === "string" ? tag.trim() : tag.name?.trim();
          const tagSlug = (tag.slug || tagName || "").toLowerCase().trim();

          if (!tagSlug) continue;

          if (!tagId) {
            // Find existing tag by slug
            const { data: existingTag } = await supabase
              .from("tags")
              .select("id")
              .eq("slug", tagSlug)
              .maybeSingle();

            if (existingTag?.id) {
              tagId = existingTag.id;
            } else {
              // Create canonical tag
              const canonicalName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
              const { data: createdTag } = await supabase
                .from("tags")
                .insert([
                  {
                    name: canonicalName,
                    slug: tagSlug,
                    is_preset: false,
                  },
                ])
                .select("id")
                .maybeSingle();

              if (createdTag?.id) {
                tagId = createdTag.id;
              }
            }
          }

          if (tagId) {
            linksToInsert.push({
              submission_id: id,
              tag_id: tagId,
            });
          }
        }

        if (linksToInsert.length > 0) {
          await supabase.from("submission_tags").insert(linksToInsert);
        }
      } catch (tagErr) {
        console.warn("Failed to sync tags in PATCH /api/admin/submissions:", tagErr);
      }
    }

    // Sync with poems table for public view if published
    if (updatePayload.is_published === true || updatePayload.status === "published") {
      try {
        await supabase.from("poems").upsert(
          [
            {
              id: id,
              title: title || updatedSub?.title,
              body: contentBody || updatedSub?.body,
              author: author || updatedSub?.author || "Anonymous",
              category: category || updatedSub?.category || "General",
            },
          ],
          { onConflict: "id" }
        );
      } catch (poemSyncErr) {
        // If upsert fails due to schema, attempt insert
        await supabase.from("poems").insert([
          {
            title: title || updatedSub?.title,
            body: contentBody || updatedSub?.body,
            author: author || updatedSub?.author || "Anonymous",
            category: category || updatedSub?.category || "General",
          },
        ]);
      }
    } else if (updatePayload.is_published === false || (updatePayload.status && updatePayload.status !== "published")) {
      // If unpublished, ensure removed from live poems
      try {
        await supabase.from("poems").delete().eq("id", id);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedSub,
      authenticated: !!user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase } = getSupabaseServerClient(request);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("submissions").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also delete any matching live poem entry
    try {
      await supabase.from("poems").delete().eq("id", id);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      authenticated: !!user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete submission" },
      { status: 500 }
    );
  }
}
