package com._8.store.service;

import com._8.store.entity.Order;
import com._8.store.entity.OrderItem;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public byte[] generateInvoicePdf(Order order) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);

            document.add(new Paragraph("Order Invoice", titleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Order ID: " + order.getId(), bodyFont));
            document.add(new Paragraph("Customer: " + order.getUser().getName(), bodyFont));
            document.add(new Paragraph("Email: " + order.getUser().getEmail(), bodyFont));
            document.add(new Paragraph("Date: " + order.getCreatedAt().format(DATE_FORMATTER), bodyFont));
            document.add(new Paragraph("Shipping Address:", bodyFont));
            document.add(new Paragraph(formatShippingAddress(order), bodyFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4f, 1.5f, 2f, 2f});
            addHeaderCell(table, "Product", headerFont);
            addHeaderCell(table, "Quantity", headerFont);
            addHeaderCell(table, "Unit Price", headerFont);
            addHeaderCell(table, "Line Total", headerFont);

            for (OrderItem item : order.getItems()) {
                table.addCell(new Phrase(item.getProduct().getName(), bodyFont));
                table.addCell(new Phrase(String.valueOf(item.getQuantity()), bodyFont));
                table.addCell(new Phrase("$" + item.getUnitPrice().setScale(2, RoundingMode.HALF_UP), bodyFont));
                table.addCell(new Phrase("$" + item.getLineTotal().setScale(2, RoundingMode.HALF_UP), bodyFont));
            }

            document.add(table);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total Price: $" + order.getTotalPrice().setScale(2, RoundingMode.HALF_UP), titleFont));
            document.close();

            return outputStream.toByteArray();
        } catch (DocumentException exception) {
            throw new IllegalStateException("Failed to generate invoice PDF.", exception);
        } catch (Exception exception) {
            throw new IllegalStateException("Unexpected error while generating invoice PDF.", exception);
        }
    }

    private void addHeaderCell(PdfPTable table, String label, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label, font));
        cell.setBackgroundColor(new Color(42, 42, 42));
        cell.setPadding(8f);
        table.addCell(cell);
    }

    private String formatShippingAddress(Order order) {
        List<String> lines = new ArrayList<>();

        addIfPresent(lines, order.getShippingStreet());

        String cityLine = joinWithSeparator(", ", order.getShippingCity(), order.getShippingPostalCode());
        addIfPresent(lines, cityLine);
        addIfPresent(lines, order.getShippingCountry());

        if (!lines.isEmpty()) {
            return String.join("\n", lines);
        }

        addIfPresent(lines, order.getUser().getStreet());

        cityLine = joinWithSeparator(", ", order.getUser().getCity(), order.getUser().getPostalCode());
        addIfPresent(lines, cityLine);
        addIfPresent(lines, order.getUser().getCountry());

        return lines.isEmpty() ? "Address not available for this order." : String.join("\n", lines);
    }

    private void addIfPresent(List<String> lines, String value) {
        if (value != null && !value.isBlank()) {
            lines.add(value);
        }
    }

    private String joinWithSeparator(String separator, String left, String right) {
        boolean hasLeft = left != null && !left.isBlank();
        boolean hasRight = right != null && !right.isBlank();

        if (hasLeft && hasRight) {
            return left + separator + right;
        }

        if (hasLeft) {
            return left;
        }

        if (hasRight) {
            return right;
        }

        return "";
    }
}
