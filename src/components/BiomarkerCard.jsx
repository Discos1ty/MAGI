import Card from './Card.jsx'

// `xai` is the same /api/predict response passed to XaiCard
export default function BiomarkerCard({ xai }) {
  return (
    <Card title="Tabular & biomarker analysis" tag="SHAP · distribution" dot="var(--rose)">
      {!xai ? (
        <p className="text-[13px] text-[var(--ink-dim)]">
          Upload a single-patient CSV to see the global feature attribution of the quantum model.
        </p>
      ) : (
        <>
          <h3 className="text-[12.5px] font-medium mb-2">Global model attribution</h3>
          <div className="border border-[var(--line)] rounded-[8px] p-2 bg-white min-h-[120px] flex items-center justify-center">
            {xai.global_xai_plot ? (
              <img
                src={xai.global_xai_plot}
                alt="Global SHAP summary across test patients"
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            ) : (
              <span className="text-[12px] text-[var(--ink-faint)]">Chart unavailable</span>
            )}
          </div>
          <div className="text-center text-[10.5px] text-[var(--ink-faint)] mt-1.5">
            SHAP value — impact on quantum VQC prediction
          </div>
        </>
      )}
    </Card>
  )
}