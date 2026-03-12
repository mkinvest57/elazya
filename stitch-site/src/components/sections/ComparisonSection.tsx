"use client"

import { Check, X } from "lucide-react"

export function ComparisonSection() {
  const rows = [
    { feature: "Confidentialité", elazya: "100% locale", cloud: "Données exploitées" },
    { feature: "Accès système", elazya: "Finder, mails, apps", cloud: "Navigateur uniquement" },
    { feature: "Mode hors-ligne", elazya: "Fonctionnel", cloud: "Inexploitable" },
    { feature: "Coût sur 3 ans", elazya: "197€ (Achat unique)", cloud: "~750€ (Abonnement)" },
    { feature: "Vos données", elazya: "Restent chez vous", cloud: "Servent à l'entraînement" },
  ]

  return (
    <section className="py-28 relative border-t border-slate-200/50 bg-[#f8fbff]/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            <span className="text-slate-800">Pourquoi un logiciel natif</span>
            {' '}
            <span className="text-gradient-primary">plutôt qu&apos;un cloud ?</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Seule une application Mac peut garantir que vos données ne quittent jamais votre ordinateur.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/80 overflow-hidden bg-white/80 backdrop-blur-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest w-1/3">Fonctionnalité</th>
                  <th className="p-6 text-xs font-bold text-primary uppercase tracking-widest">Elazya</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Cloud IA (SaaS)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 text-slate-600 font-semibold">{row.feature}</td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-2 text-primary font-bold">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20"><Check className="w-3 h-3" /></span>
                        {row.elazya}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-2 text-slate-500 font-medium">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><X className="w-3 h-3 text-slate-400" /></span>
                        {row.cloud}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
