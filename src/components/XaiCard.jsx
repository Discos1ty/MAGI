import Card from './Card.jsx'

// `xai` is the /api/predict response: { patient_xai_plot, xai_note, ... }
export default function XaiCard({ xai }) {
  return (
    <Card title="XAI view" tag="SHAP · quantum VQC" dot="var(--forest)">
      {!xai ? (
        <p className="text-[13px] text-[var(--ink-dim)]">
          Upload a single-patient CSV to see which features drove the quantum model's prediction.
        </p>
      ) : (
        <>
          <h3 className="text-[12.5px] font-medium mb-2">Biomarker diagnostic impact</h3>
          <div className="border border-[var(--line)] rounded-[8px] p-2 bg-white min-h-[120px] flex items-center justify-center">
            {xai.patient_xai_plot ? (
              <img
                src={xai.patient_xai_plot}
                alt="Local SHAP explanation for this patient"
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            ) : (
              <span className="text-[12px] text-[var(--ink-faint)]">Chart unavailable</span>
            )}
          </div>
          {xai.xai_note && (
            <p className="text-[10.5px] text-[var(--ink-faint)] mt-3">{xai.xai_note}</p>
          )}
        </>
      )}
    </Card>
  )
}