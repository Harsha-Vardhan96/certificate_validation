package com.certiverify.certificate.service;

import com.certiverify.certificate.model.Certificate;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

@Service
public class PdfService {

    public byte[] generateCertificatePdf(Certificate certificate) {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 36);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 24);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 16);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("CERTIVERIFY GLOBAL", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(50);
            document.add(title);

            // Subtitle
            Paragraph subtitle = new Paragraph("Certificate of Completion", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(40);
            document.add(subtitle);

            // Body
            Paragraph body = new Paragraph("This is to certify that", textFont);
            body.setAlignment(Element.ALIGN_CENTER);
            document.add(body);

            Paragraph name = new Paragraph(certificate.getStudentName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28));
            name.setAlignment(Element.ALIGN_CENTER);
            name.setSpacingBefore(10);
            name.setSpacingAfter(10);
            document.add(name);

            Paragraph body2 = new Paragraph("has successfully completed the course", textFont);
            body2.setAlignment(Element.ALIGN_CENTER);
            document.add(body2);

            Paragraph course = new Paragraph(certificate.getCourseName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20));
            course.setAlignment(Element.ALIGN_CENTER);
            course.setSpacingBefore(10);
            course.setSpacingAfter(10);
            document.add(course);

            Paragraph body3 = new Paragraph("at " + certificate.getInstitutionName(), textFont);
            body3.setAlignment(Element.ALIGN_CENTER);
            document.add(body3);

            // QR Code
            if (certificate.getQrCodeData() != null) {
                byte[] qrBytes = Base64.getDecoder().decode(certificate.getQrCodeData());
                Image qrImage = Image.getInstance(qrBytes);
                qrImage.setAlignment(Element.ALIGN_CENTER);
                qrImage.scaleAbsolute(150, 150);
                document.add(qrImage);
            }

            // Footer Details
            Paragraph issueDate = new Paragraph("Issued on: " + certificate.getIssueDate().toString(), textFont);
            issueDate.setAlignment(Element.ALIGN_CENTER);
            document.add(issueDate);

            Paragraph certNumber = new Paragraph("Certificate Number: " + certificate.getCertificateNumber(), smallFont);
            certNumber.setAlignment(Element.ALIGN_CENTER);
            document.add(certNumber);

            Paragraph hash = new Paragraph("SHA-256 Hash: " + certificate.getCertificateHash(), smallFont);
            hash.setAlignment(Element.ALIGN_CENTER);
            document.add(hash);

            Paragraph verifyInstruction = new Paragraph("Verify this certificate by scanning the QR code.", smallFont);
            verifyInstruction.setAlignment(Element.ALIGN_CENTER);
            verifyInstruction.setSpacingBefore(10);
            document.add(verifyInstruction);

            document.close();

        } catch (DocumentException | java.io.IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return out.toByteArray();
    }
}
