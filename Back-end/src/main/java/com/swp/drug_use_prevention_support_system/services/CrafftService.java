package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.responses.CrafftSubmissionDTO;
import com.swp.drug_use_prevention_support_system.domain.entities.*;
import com.swp.drug_use_prevention_support_system.domain.enums.AssessmentType;
import com.swp.drug_use_prevention_support_system.domain.enums.RiskLevel;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentRepository;
import com.swp.drug_use_prevention_support_system.repositories.AssessmentResultRepository;
import com.swp.drug_use_prevention_support_system.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CrafftService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    public AssessmentResult processCrafftSubmission(CrafftSubmissionDTO dto) {
//        // 1. Tìm user
//        User user = userRepository.findByUsername(dto.getUsername())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        // 2. Tìm assessment CRAFFT
//        Assessment assessment = assessmentRepository.findByAssessmentType(AssessmentType.CRAFFT)
//                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        // 1. Tính điểm và mức độ nguy cơ
        int score = calculateCrafftScore(dto);
        String riskLevelStr = determineRiskLevel(score);
        String suggestedAction = getAdviceByRiskLevel(riskLevelStr);

        // 2. Chuyển riskLevelStr sang enum
        RiskLevel riskLevelEnum = RiskLevel.LOW;
        if ("High risk".equals(riskLevelStr)) riskLevelEnum = RiskLevel.HIGH;
        else if ("Moderate risk".equals(riskLevelStr)) riskLevelEnum = RiskLevel.MODERATE;

        // 3. Tìm Assessment để liên kết, nếu cần
        Assessment assessment = assessmentRepository.findByAssessmentType(AssessmentType.CRAFFT)
                .orElse(null); // Không ném lỗi nếu không tìm thấy

        // 4. Tìm user — nếu không có thì chỉ trả về kết quả, không lưu
        Optional<User> userOpt = userRepository.findByUsername(dto.getUsername());
        if (userOpt.isPresent()) {
            AssessmentResult result = AssessmentResult.builder()
                    .score(score)
                    .riskLevel(riskLevelEnum)
                    .suggestedAction(suggestedAction)
                    .completedTime(LocalDateTime.now())
                    .user(userOpt.get())
                    .assessment(assessment)
                    .build();
            assessmentResultRepository.save(result);
            return result;
        } else {
            // Trả về kết quả tạm thời không có ID hoặc user/assessment
            return AssessmentResult.builder()
                    .score(score)
                    .riskLevel(riskLevelEnum)
                    .suggestedAction(suggestedAction)
                    .completedTime(LocalDateTime.now())
                    .build();
        }

    }

    // Tính tổng số câu "yes" trong phần B
    public static int calculateCrafftScore(CrafftSubmissionDTO dto) {
        int score = 0;
        if ("yes".equalsIgnoreCase(dto.getCar())) score++;
        if ("yes".equalsIgnoreCase(dto.getRelax())) score++;
        if ("yes".equalsIgnoreCase(dto.getAlone())) score++;
        if ("yes".equalsIgnoreCase(dto.getForget())) score++;
        if ("yes".equalsIgnoreCase(dto.getFamily())) score++;
        if ("yes".equalsIgnoreCase(dto.getTrouble())) score++;
        return score;
    }

    // Xác định mức độ nguy cơ dựa trên CRAFFT score
    public static String determineRiskLevel(int score) {
        if (score >= 2) {
            return "High risk";
        } else if (score == 1) {
            return "Moderate risk";
        } else {
            return "Low risk";
        }
    }

    // Đưa ra lời khuyên theo mức độ nguy cơ
    public static String getAdviceByRiskLevel(String riskLevel) {
        switch (riskLevel) {
            case "High risk":
                return "Bạn nên tham khảo ý kiến chuyên gia tâm lý hoặc bác sĩ. Việc sử dụng chất kích thích ở mức độ cao có thể ảnh hưởng nghiêm trọng đến sức khỏe và cuộc sống.";
            case "Moderate risk":
                return "Bạn có dấu hiệu sử dụng chất kích thích. Hãy trao đổi với người có chuyên môn để được tư vấn sớm, tránh tình trạng nghiêm trọng hơn.";
            case "Low risk":
                return "Hiện tại bạn không có dấu hiệu rõ ràng liên quan đến việc sử dụng chất kích thích. Tuy nhiên, hãy duy trì lối sống lành mạnh và cẩn trọng trước các nguy cơ tiềm ẩn.";
            default:
                return "Không xác định được mức độ nguy cơ. Vui lòng kiểm tra lại kết quả.";
        }
    }
}