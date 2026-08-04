import Link from 'next/link';
import { Feather, Headphones, BookOpen, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2A29] font-sans antialiased">
      
      {/* Navigation */}
      <nav className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between border-b border-[#EADFCF]">
        <Link href="/" className="font-serif text-2xl tracking-wide font-medium flex items-center gap-2">
          <Feather className="w-5 h-5 stroke-[1.75]" />
          <span>Stanza.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="#explore" className="hover:opacity-70 transition-opacity">Explore</Link>
          <Link href="#features" className="hover:opacity-70 transition-opacity">Features</Link>
          <Link 
            href="/editor" 
            className="px-4 py-2 rounded-full bg-[#2C2A29] text-[#FAF8F5] hover:bg-opacity-90 transition-colors"
          >
            Start Writing
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <span className="text-xs uppercase tracking-widest text-[#7C7775] font-semibold">
            A Sanctuaried Reading Space
          </span>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.15] mt-4 mb-6 font-normal">
            Where words find room to breathe.
          </h1>
          <p className="text-lg text-[#5A5654] max-w-xl mx-auto leading-relaxed mb-10">
            Publish your verses, curate quiet collections, and discover contemporary poetry free from distracting feeds and noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] font-medium hover:bg-opacity-90 transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Read Contemporary Verse</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/editor" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#D5C9B8] hover:border-[#2C2A29] transition-all"
            >
              Distraction-Free Editor
            </Link>
          </div>
        </section>

        {/* Featured Poem Showcase */}
        <section id="explore" className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-[#F3EFEA] border border-[#E3D9CC] rounded-2xl p-8 md:p-14 relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest text-[#7C7775] font-semibold block mb-8">
              Poem of the Day
            </span>
            
            <blockquote className="font-serif text-xl md:text-2xl leading-relaxed text-[#1F1E1D] whitespace-pre-line mb-8">
              {`The quiet does not ask for answers,
it only holds the space
where light settles on wooden floors,
and time forgets its pace.`}
            </blockquote>
            
            <div className="flex items-center justify-between pt-6 border-t border-[#E3D9CC]/60">
              <div>
                <p className="font-serif text-base font-medium">Untitled in Autumn</p>
                <p className="text-xs text-[#7C7775]">by Elena Rostova</p>
              </div>
              <Link href="/explore" className="text-xs font-semibold uppercase tracking-wider text-[#2C2A29] hover:underline inline-flex items-center gap-1">
                <span>Read Collection</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid using Lucide SVG Library */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-20 border-t border-[#EADFCF]">
          <h2 className="font-serif text-3xl text-center mb-16">Crafted specifically for poetry</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-white/40 border border-[#EADFCF]/70 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-[#F3EFEA] text-[#2C2A29]">
                <Feather className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-serif text-lg font-medium">Preserved Formatting</h3>
              <p className="text-sm text-[#5A5654] leading-relaxed">
                Custom line breaks, indentation, and stanza structures remain exact on every screen size.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/40 border border-[#EADFCF]/70 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-[#F3EFEA] text-[#2C2A29]">
                <Headphones className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-serif text-lg font-medium">Spoken Word Audio</h3>
              <p className="text-sm text-[#5A5654] leading-relaxed">
                Embed author recitations alongside written text so readers can listen to poetry in your voice.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/40 border border-[#EADFCF]/70 space-y-3">
              <div className="p-3 w-fit rounded-lg bg-[#F3EFEA] text-[#2C2A29]">
                <BookOpen className="w-5 h-5 stroke-[1.75]" />
              </div>
              <h3 className="font-serif text-lg font-medium">Digital Chapbooks</h3>
              <p className="text-sm text-[#5A5654] leading-relaxed">
                Organize standalone poems into cohesive digital collections and limited-edition chapbooks.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-3xl mb-4">Ready to share your voice?</h2>
          <p className="text-[#5A5654] mb-8">Join thousands of poets publishing their work on Stanza.</p>
          <Link 
            href="/editor" 
            className="px-8 py-3.5 rounded-full bg-[#2C2A29] text-[#FAF8F5] font-medium hover:bg-opacity-90 inline-block"
          >
            Create Your Chapbook
          </Link>
        </section>
      </main>
    </div>
  );
}