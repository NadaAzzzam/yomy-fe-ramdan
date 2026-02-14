import { IonSpinner } from "@ionic/react";

/** Minimal fallback for lazy-loaded pages — keeps bundle tiny */
export function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        background: "var(--ion-background-color, #080E1F)",
      }}
    >
      <IonSpinner name="crescent" />
    </div>
  );
}
