import { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import toast, { Toaster } from 'react-hot-toast';

export const FeedPage = () => {
  const [postText, setPostText] = useState('');

  const handleShare = () => {
    if (!postText.trim()) return;
    toast.success('Your Eco-Win has been shared!', { id: 'share' });
    setPostText('');
  };

  return (
    <MainLayout>
      <Toaster position="bottom-center" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Feed Column */}
        <section className="xl:col-span-8 flex flex-col gap-8">
          {/* Share Input Box */}
          <div className="bg-surface-container-lowest rounded-lg p-6 flex items-center gap-4 transition-all duration-300">
            <img alt="Primary user profile" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs-aozSEloHJ_7CuDbTuEzQYHwHYTCB4ICu1BTHuj_3iafyk34Y_Nf5qEIqfl5Jw10UK-egK6jIxIpxqnfjI7Fws6aPrNOaNtL_30a3r-MxlvLFYRUvBcXBRET4o02O2OvgXvb-ALT83eyrtPsmZudZYTlnzeP7t5u2-Ao-NSkslzcuu4vtBb96lMekyzMAfICml8ZIg-i0HnCwfPMKn3O5QtBz-id5ziU5RDdros2ieJe2C5TCDMpeN2tEJ-QZgNo4PyaOy5-oEcm"/>
            <div className="flex-1 bg-surface-container-low rounded-full px-6 py-3 flex items-center justify-between cursor-text hover:bg-surface-container transition-colors focus-within:ring-2 ring-primary">
              <input 
                type="text" 
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                className="bg-transparent border-none outline-none flex-1 text-on-surface text-sm" 
                placeholder="Share your Eco-Win! Press Enter to post..." 
              />
              <button onClick={handleShare} className="material-symbols-outlined text-primary hover:text-primary-dim cursor-pointer ml-2">send</button>
              <button className="material-symbols-outlined text-primary hover:text-primary-dim cursor-pointer ml-2">photo_camera</button>
            </div>
          </div>

          {/* Feed Post 1 */}
          <article className="bg-surface-container-lowest rounded-lg overflow-hidden group">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img alt="Lily Blossom avatar" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATiqhzh5xmUmxxQ_bB6ajAF4kiJscO20THIzYZBLVA6L-CezMu_2If-L5R9H-CgnYJI1KzUh8YRpR_qV0nn_18pAVGR2g-MzXOUU-_UBQ3RCyYIg3HBfNJuTOWugjSwM6OSV7YOPbCu1-RUG5T1gKge3ZcCNB0Ga2-6cp2bNRz0ozvcRzGAKhbN_RGk7G2mT7YQMSy647XtxThJYFoT2aSiMVbh4CzQ1KglbZNzG9xS0JhoDX7TAl3j_ZGcBYICO8UEW2BNEWXGv4c"/>
                <div>
                  <h4 className="font-headline font-bold text-on-surface">Lily Blossom</h4>
                  <span className="text-xs text-on-surface-variant">2 hours ago</span>
                </div>
              </div>
              <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">ECO-WIN</span>
            </div>
            <div className="px-8 pb-6">
              <p className="text-on-surface text-lg leading-relaxed">Just harvested my first batch of organic cherry tomatoes! No pesticides, just pure sunshine and compost. 🍅🌿 #OrganicGarden #SustainableLiving</p>
            </div>
            <div className="px-8 mb-6">
              <img alt="Garden tomatoes" className="w-full h-96 object-cover rounded-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA02IF_O1iNHr8z1O1Tjw9QUKdlKrFo4LQ06Y8T-oqRoVW8QXlJAO2bxhpGPXVGPnwuztMfvjbLou2KUVZxJjtOyJTp0AF3M1YAH-IIza6y4weTgLKQGrT4fX50F1D13Ar1fFCRIiC2T3wHlq6IjSI-37FnlzLYupjQf92wIOoiGi3n0W7DM1Z_2uV55_nm2G4JaApv_OYgCe6dwetn2h2J3A6MDRqjJyK8oW4rDbuAqEZcmcPM4uDaSFXGVT575KliVAizgoSQJ6R7"/>
            </div>
            <div className="px-8 py-6 flex items-center justify-between border-t border-surface-container-low/30">
              <div className="flex items-center gap-6">
                <button onClick={() => toast.success('You loved this post!')} className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> Love this!
                </button>
                <button onClick={() => toast('Comments feature coming soon!', { icon: '💬' })} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span className="font-bold">12 Comments</span>
                </button>
              </div>
              <button onClick={() => toast.success('Link copied to clipboard!')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </article>

          {/* Feed Post 2 */}
          <article className="bg-surface-container-lowest rounded-lg overflow-hidden group">
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img alt="Kai Rivers avatar" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Fslog_vURO73oy28lbMGarft5323PUEr2FCZhjVSIqKf3SQ-bIkNzNllBC5YykKn3wgTrQKkxu42omAwMAP8byjG_Kroh_nf-kZ3K6Ha1erkGjk0azzNWfDgqIk5JVXTrLoOxhbsAM4HOagnEj057vNr9cUH9JIxLJv-WlKXEdxmTmcDy0XRskaJx61NHdt_DvSoMdktwBzqhmmSCrI1NcyQqpk3u5-kEmAv8lSuJix9YkqTZ0ERDN-LE45d8bXDZHrBN8EbFRs9"/>
                <div>
                  <h4 className="font-headline font-bold text-on-surface">Kai Rivers</h4>
                  <span className="text-xs text-on-surface-variant">5 hours ago</span>
                </div>
              </div>
              <span className="bg-secondary-container text-on-secondary-fixed text-[0.75rem] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">ECO-WIN</span>
            </div>
            <div className="px-8 pb-6">
              <p className="text-on-surface text-lg leading-relaxed">Spent the morning with the local crew cleaning up the West River bank. We collected over 15 bags of plastic! Our waterways deserve better. 🌊💪 #RiverCleanup #EcoWarrior</p>
            </div>
            <div className="px-8 mb-6">
              <img alt="River cleanup" className="w-full h-96 object-cover rounded-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYcPkwygHlzZ-vjq0BDPEFoixF8g5ptrFdg0wJG7kVS1uYTA_hE_InMRQRQFdVoFYzlN5O50Q70pmHDUZPqbTbldcImJ4oGFkeP9PiOv2tY1EMYSauwwNVK8XxfK6rnzvhjkZecPI2IVY9MhloaMi8Wx1X07Y9QMVMtoGUcnbKkGyeGzyiTuy75_7Reqjzccj8vtEWjBQnqfnimmUTUBbqpAnHQb_i-CpB_5F_uK7jmW1Ef7BOzXjxiOdmHcGyL-TP3Lepq_zLahv6"/>
            </div>
            <div className="px-8 py-6 flex items-center justify-between border-t border-surface-container-low/30">
              <div className="flex items-center gap-6">
                <button onClick={() => toast.success('You loved this post!')} className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span> Love this!
                </button>
                <button onClick={() => toast('Comments feature coming soon!', { icon: '💬' })} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">chat_bubble</span>
                  <span className="font-bold">24 Comments</span>
                </button>
              </div>
              <button onClick={() => toast.success('Link copied to clipboard!')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </article>
        </section>

        {/* Sidebar Column */}
        <aside className="xl:col-span-4 flex flex-col gap-8">
          {/* Pending Requests */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center justify-between">
              Pending Requests
              <span className="bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded-full">2</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt="Mira Sun avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuuGF_27D7Vd4_1OSReRtt2NHrlslSZy2UVedZD75naf0i92UqTDFJUttRYrqKSnMFU8pwofnqOQIDuNj6JoqBZdgc2jVSAmgQzdgThQtSos0d96RxeiRbmKNPihSrB8DA-DHOT6ko3tR6jC0TefT7XIjKcIIfCKRwnI81DGULDE9m7O0qmBvr3JRLi45vRNSGEAXDjqSsVAnRyWnLN6tiZ5eTGBFyTMp7yDLpwrYtC5BmKhke1i9YmRHkJGlsPAd3Bq53QugvXtUn"/>
                  <span className="font-bold text-sm">Mira Sun</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img alt="Leo Green avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlAhGjd-pi5JUDp6mJWztTaTnSVVCwdRL7zcdf4G772WyOks4IkFOL5pF7wEU7CoVol_np_4PBgMxeRrildl_DrLEntePGJse-Rfz5OZMmUzkFT3jNaEMYh36eoCJmpITLIPeu2chkQft4gL7jP7gOHlsQ0E1BTaA6ag_SKZPNi9FAKabd6CdjDAgxqe1MDY3SMTayM1U-SR5yEOD0gJNn1gE8LeO49ohR9mIzhZEcP2d4xnIxwUJTmRPbmnLWorM_Txw6cw1v7eUy"/>
                  <span className="font-bold text-sm">Leo Green</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Active Ninjas */}
          <section className="bg-surface-container-low rounded-lg p-6">
            <h3 className="font-headline font-bold text-lg mb-6">Active Ninjas</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Sara Seedling avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoCaJMwibyxb6gyb6YqJuS9ceNvuCNyCEL7DD0ZzFTyw-5nD63UKQa_0N1kyfQSfn9JtJh75mJr3c68c-5SvpyuwdNtnEr9f5vGIcewlsKz6pUJNm5i87vlgcbOXTN7FeGTG4tflxVPUGm-xdw6Y8gHHes3A1kyHkjED5oqttkD467PIkWBJ_pMGr2V3WRUIqj6atlm2zrn3HS8Ia-0sfmkm404gOMy1RvSVqEO4dHe5sfMpTh6vhbN_i5KLSZ5YRMiby_TAmKiWRx"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Sara Seedling</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"Planting 50 new oaks today!"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Ben Bike-alot avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPM76WKKy8fPZ62dlKE_E1Xdnk5tugMlEvYQ1pWqZvucfOsnddGUusSGRdqBINqzgXDGutOIsta90uRoCQ7FtAiuS7iI-ywkJudFUi5bjBghmGLqK6UZKjooQ7XcbPAoCRlNGvRBcpkt21JHi-QkPCWA2UQkQZgB61wC8lyU3evGY2Y-cM07LqWCpKoJ50BTC2bAyiwwDaCXBRRhycRHzlwn-XPQXYWF40-cjs9RculfUFm4yd7Ny_fFYxc8jL70eWOE-WGlPVGMtx"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Ben Bike-alot</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"100 miles commute this week 🚲"</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img alt="Amy Aqua avatar" className="w-11 h-11 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQUlNYJPQxEaahWlK74yLGPTV3lFSpFlEzTGdVFPQMPBhSlVVVN8mp701qdVzq-uzajstNevw7YTabLsuC-_-J6NUo9zji44OrLmjluX_GV1xprWFFaiCE2aZ1suHNB8zYUCK8Q9Dywg0CrEmeb9PjfnUEiG5caOz5X0w8ygpR-bKnmov-ovXAw_VvDcxjCD1OusuFRfQuRUgJZjnLEmWls8XqTwC5lyiQXKlR1OjNtdoPsTQ4Mz8iC66Br3G2qsi8GLCHPckxjWZs"/>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-container border-2 border-surface-container-low rounded-full"></div>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Amy Aqua</h5>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"Installed a gray-water system!"</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <div className="px-6 py-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant opacity-50">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Eco-Guidelines</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
            <span>© 2024 Eco-Ninjas</span>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
};
