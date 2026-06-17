import { Phone, Mail, MapPin, Clock, Navigation, Map } from 'lucide-react';

export default function Contact() {
  const contactDetails = [
    {
      icon: <Phone className="w-5 h-5 text-yellow-500" />,
      title: "Talk To Us",
      val: "9049688172 (Admissions Desk)",
      clickUrl: "tel:9049688172"
    },
    {
      icon: <Mail className="w-5 h-5 text-yellow-500" />,
      title: "Write An Email",
      val: "lionskaratepune@gmail.com",
      clickUrl: "mailto:lionskaratepune@gmail.com"
    },
    {
      icon: <MapPin className="w-5 h-5 text-yellow-500" />,
      title: "LIONS DOJO VENUE",
      val: "Vasundhara Pre-Primary School, near Ganesh Temple, Manaji Nagar, Narhe, Pune, 411041",
      clickUrl: "https://maps.app.goo.gl/V7t7UCSAWkaVfV4Y9?g_st=aw"
    }
  ];

  const operatingHours = [
    { day: "Mon, Wed, Fri", hours: "04:30 PM – 09:30 PM" },
    { day: "Tue, Thu", hours: "05:00 PM – 09:30 PM" },
    { day: "Saturday", hours: "09:00 AM – 03:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];

  return (
    <section id="contact" className="py-14 sm:py-20 bg-zinc-950 border-t border-zinc-900/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-yellow-500 font-heading text-xs font-bold uppercase tracking-[0.25em] block mb-3">VISIT OUR DOJO</span>
          <h2 className="font-title text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            FIND THE <span className="gradient-text-gold">WAY</span>
          </h2>
          <p className="text-zinc-400 text-sm">
            Our training academy is centrally located at Vasundhara Pre-Primary School (near Ganesh Temple, Manaji Nagar) in Narhe, Pune, fully accessible with premium safety flooring and guidance parameters.
          </p>
        </div>

        {/* Info Grid & Map Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Texts Contacts Column */}
          <div className="flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="font-title text-xl font-bold text-white uppercase tracking-wider mb-2">Get in Touch Directly</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Whether you have queries regarding children developmental programs, self-defense packages, belt rank certificates, or tournament coaching under Shihan, we are here to guide you.
              </p>
            </div>

            {/* Core Address / Phone Parameters */}
            <div className="space-y-4">
              {contactDetails.map((item, id) => (
                <a 
                  key={id}
                  href={item.clickUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start space-x-4 bg-slate-900/40 border border-zinc-900/60 p-4 rounded-lg hover:border-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="bg-slate-950/80 p-2.5 rounded border border-zinc-800">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-xs uppercase text-zinc-400 tracking-wider">
                      {item.title}
                    </h4>
                    <span className="text-zinc-200 text-sm font-medium mt-1 block">
                      {item.val}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Timing specifications */}
            <div className="bg-slate-900/40 border border-zinc-900/60 p-6 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-500 mb-4">
                <Clock className="w-4 h-4" />
                <h4 className="font-heading font-bold text-zinc-200 text-xs uppercase tracking-wider">DOJO TRAINING PERIODS</h4>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {operatingHours.map((oh, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-zinc-900">
                    <span className="font-medium text-zinc-400">{oh.day}</span>
                    <span className="font-mono text-zinc-500">{oh.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map & Actions Column */}
          <div className="flex flex-col space-y-4">
            <div className="h-[340px] rounded-lg overflow-hidden border border-zinc-900 relative">
              <iframe 
                src="https://maps.google.com/maps?q=Vasundhara%20Pre-Primary%20School%20Narhe%20Pune&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)' }}
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="LIONS KARATE CLUB PUNE Venue Location Map"
              />
            </div>

            {/* Address Display & Interactive Map Buttons */}
            <div className="bg-slate-900/30 border border-zinc-900/80 p-5 rounded-lg space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono block">Official Venue Address:</span>
                <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                  Vasundhara Pre-Primary School, near Ganesh Temple,<br />
                  Manaji Nagar, Narhe, Pune, Maharashtra 411041, India<br />
                  <span className="text-yellow-500 font-bold block mt-1">Location Landmark: Vasundhara School Dojo</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a 
                  href="https://maps.app.goo.gl/V7t7UCSAWkaVfV4Y9?g_st=aw"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-heading font-extrabold tracking-wider uppercase py-3 px-4 rounded transition-colors text-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <a 
                  href="https://maps.app.goo.gl/V7t7UCSAWkaVfV4Y9?g_st=aw"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-100 text-xs font-heading font-extrabold tracking-wider uppercase py-3 px-4 rounded transition-colors text-center"
                >
                  <Map className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
