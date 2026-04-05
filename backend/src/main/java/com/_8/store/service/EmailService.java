package com._8.store.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendInvoiceEmail(String toEmail, String customerName, Long orderId, byte[] invoicePdf) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Your Order Invoice");
            helper.setText(
                    "Hello " + customerName + ",\n\n" +
                            "Thank you for your order. Your invoice for order #" + orderId + " is attached.\n\n" +
                            "Best regards,\nAurelia Editions"
            );
            helper.addAttachment(
                    "invoice-order-" + orderId + ".pdf",
                    new ByteArrayResource(invoicePdf),
                    "application/pdf"
            );

            mailSender.send(message);
        } catch (MessagingException exception) {
            throw new IllegalStateException("Failed to send invoice email.", exception);
        }
    }
}
