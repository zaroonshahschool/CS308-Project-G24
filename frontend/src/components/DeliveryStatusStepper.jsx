export default function DeliveryStatusStepper({ status }) {
    const steps = ["processing", "in-transit", "delivered"];
    const labels = ["Processing", "In Transit", "Delivered"];
    const normalized = status?.toLowerCase().replace(/\s+/g, "-");
    const currentIndex = steps.indexOf(normalized);

    return (
        <div className="delivery-stepper">
            {steps.map((step, i) => (
                <div key={step} className="delivery-stepper-step">
                    <div
                        className={`delivery-stepper-circle${i <= currentIndex ? " delivery-stepper-circle--active" : ""}`}
                    >
                        {i < currentIndex ? "✓" : i + 1}
                    </div>
                    <p
                        className={`delivery-stepper-label${i === currentIndex ? " delivery-stepper-label--active" : ""}`}
                    >
                        {labels[i]}
                    </p>
                    {i < steps.length - 1 && (
                        <div
                            className={`delivery-stepper-line${i < currentIndex ? " delivery-stepper-line--active" : ""}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}