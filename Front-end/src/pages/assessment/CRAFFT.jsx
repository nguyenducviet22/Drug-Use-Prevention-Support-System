import React, { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation, Trans } from "react-i18next"; // Đảm bảo import Trans
import "./craft.css"; // Import file CSS cho CRAFFT
import BackButton from "../../components/BackButton";

const CrafftQuestionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("crafftQuestionnaire");

  const [formData, setFormData] = useState({
    username: user?.username || "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    car: "",
    relax: "",
    alone: "",
    forget: "",
    family: "",
    trouble: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hàm kiểm tra số nguyên không âm
  const isNonNegativeInteger = (value) => {
    return /^\d+$/.test(value);
  };

  // Kiểm tra nếu tất cả question1-4 đều là '0' và hợp lệ
  const isAllZero =
    isNonNegativeInteger(formData.question1) && formData.question1 === "0" &&
    isNonNegativeInteger(formData.question2) && formData.question2 === "0" &&
    isNonNegativeInteger(formData.question3) && formData.question3 === "0" &&
    isNonNegativeInteger(formData.question4) && formData.question4 === "0";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      "question1",
      "question2",
      "question3",
      "question4",
      "car",
    ];
    if (!isAllZero) {
      requiredFields.push("relax", "alone", "forget", "family", "trouble");
    }
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = t("required");
      }else if (
    ["question1", "question2", "question3", "question4"].includes(field) &&
    !isNonNegativeInteger(formData[field])
  ) {
    newErrors[field] = t("mustBeNonNegativeInteger");
  }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.dismiss();
      setTimeout(() => {
        toast.error(t("toastRequired"), {
          position: "top-right",
          toastId: "crafft-required",
        });
      }, 0);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Gửi dữ liệu lên backend
      const response = await fetch(
        "http://localhost:8080/api/assessment/crafft/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            username: user?.username || "",
          }),
        }
      );
      if (!response.ok) throw new Error("Submission failed");
      const data = await response.json();

  if (data?.temp) {
      // Guest: chuyển sang trang kết quả và truyền dữ liệu qua state
      navigate("/assessment-result/temp", {
        state: {
          score: data.score,
          riskLevel: data.riskLevel,
          suggestedAction: data.suggestedAction,
          completedTime: data.completedTime,
        },
      });
      return;
    }

    const resultId = data?.resultId;
    if (!resultId) {
      throw new Error("Missing result ID from server response.");
    }
    navigate(`/assessment-result/${resultId}`);
  } catch (err) {
    alert("Submission failed: " + err.message);
  } finally {
    setLoading(false);
  }
 
  };

  return (
    <Container className="py-4">
      <BackButton label={t("backToAssessments")} />
      <div className="progress-indicator mb-4">
              <div className="step active">
                <span className="step-number">
                  {t("progressIndicator.step1")}
                </span>
              </div>
              <div className="step-line"></div>
              <div className="step completed">
                <span className="step-number">
                  {t("progressIndicator.step2")}
                </span>
              </div>
            </div>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Medical Header */}
        <Card className="mb-4 border-0 medical-section">
          <div className="medical-header">
            <div className="medical-badge">{t("medicalAssessment")}</div>
            <h1 className="display-6 fw-bold mb-3" style={{ color: "white" }}>
              {t("title")}
            </h1>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>
              {t("intro")}
            </p>
          </div>
        </Card>

        <Form onSubmit={handleSubmit}>
          {/* Hidden username field */}
          <input type="hidden" name="username" value={formData.username} />

          {/* Part A */}
          <div className="medical-section">
            <div className="medical-section-header">
              <h3 className="h4 fw-bold mb-0" style={{ color: "#60a5fa" }}>
                {t("partA")}
              </h3>
            </div>
            <div className="medical-section-body">
              <div className="mb-4 p-3 bg-light rounded">
                <div
                  style={{
                    borderLeft: "4px solid #2563eb",
                    paddingLeft: "16px",
                  }}
                >
                  <p className="mb-2" style={{ color: "#374151" }}>
  <Trans i18nKey="noteAllZero" ns="crafftQuestionnaire">
    If you answer <strong style={{ color: "#60a5fa" }}>"0 days"</strong> (no use) to <strong>all</strong> of the <strong>PART A QUESTIONS</strong>, please proceed to answer <strong>only the first question</strong> in Part B ("Car").
  </Trans>
</p>
<p className="mb-0" style={{ color: "#374151" }}>
  <Trans i18nKey="noteAnyMore" ns="crafftQuestionnaire">
    If you answer <strong style={{ color: "#60a5fa" }}>1 day or more</strong> to <strong>any</strong> of the <strong>PART A QUESTIONS</strong>, please continue to answer <strong>all 6 CRAFFT questions</strong> in Part B (<strong>Car, Relax, Alone, Forget, Family/Friends, Trouble</strong>).
  </Trans>
</p>
                </div>
              </div>

              {/* Question 1 */}
              <div className="mb-4">
                <Form.Label className="fw-semibold">
                  <Trans i18nKey="question1" ns="crafftQuestionnaire">
                    1. During the <strong style={{ color: "#60a5fa", display: "inline" }}>PAST 12 MONTHS</strong>, on how many days did you drink more than a few sips of beer, wine, or any drink containing alcohol?
                  </Trans>
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <p className="text-muted small mb-2">{t("putZeroIfNone")}</p>
                <Form.Control
                  type="text"
                  placeholder={t("enterDays")}
                  value={formData.question1}
                  onChange={(e) =>
                    handleInputChange("question1", e.target.value)
                  }
                  isInvalid={!!errors.question1}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.question1}
                </Form.Control.Feedback>
              </div>

              {/* Question 2 */}
              <div className="mb-4">
                <Form.Label className="fw-semibold">
                  <Trans i18nKey="question2" ns="crafftQuestionnaire">
                    2. During the
                    <strong style={{ color: "#60a5fa" }}>PAST 12 MONTHS</strong>
                    , on how many days did you use any marijuana (cannabis,
                    weed, oil, wax, or hash by smoking, vaping, dabbing, or in
                    edibles) or "synthetic marijuana" (like "K2," "Spice")?
                  </Trans>
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <p className="text-muted small mb-2">{t("putZeroIfNone")}</p>
                <Form.Control
                  type="text"
                  placeholder={t("enterDays")}
                  value={formData.question2}
                  onChange={(e) =>
                    handleInputChange("question2", e.target.value)
                  }
                  isInvalid={!!errors.question2}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.question2}
                </Form.Control.Feedback>
              </div>

              {/* Question 3 */}
              <div className="mb-4">
                <Form.Label className="fw-semibold">
                  <Trans i18nKey="question3" ns="crafftQuestionnaire">
                    3. During the
                    <strong style={{ color: "#60a5fa" }}>PAST 12 MONTHS</strong>
                    , on how many days did you use anything else to get high
                    (like other illegal drugs, pills, prescription or
                    over-the-counter medications, and things that you sniff,
                    huff, vape, or inject)?
                  </Trans>
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <p className="text-muted small mb-2">{t("putZeroIfNone")}</p>
                <Form.Control
                  type="text"
                  placeholder={t("enterDays")}
                  value={formData.question3}
                  onChange={(e) =>
                    handleInputChange("question3", e.target.value)
                  }
                  isInvalid={!!errors.question3}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.question3}
                </Form.Control.Feedback>
              </div>

              {/* Question 4 */}
              <div className="mb-4">
                <Form.Label className="fw-semibold">
                  <Trans i18nKey="question4" ns="crafftQuestionnaire">
                    4. During the
                    <strong style={{ color: "#60a5fa" }}>PAST 12 MONTHS</strong>
                    , on how many days did you use a vaping device containing
                    nicotine and/or flavors, or use any tobacco products?
                  </Trans>
                  <span className="required-asterisk">*</span>
                </Form.Label>
                <p className="text-muted small mb-2">{t("question4Note")}</p>
                <p className="text-muted small mb-2">{t("putZeroIfNone")}</p>
                <Form.Control
                  type="text"
                  placeholder={t("enterDays")}
                  value={formData.question4}
                  onChange={(e) =>
                    handleInputChange("question4", e.target.value)
                  }
                  isInvalid={!!errors.question4}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.question4}
                </Form.Control.Feedback>
              </div>
            </div>
          </div>

          {/* Part B */}
          <div className="medical-section">
            <div className="medical-section-header">
              <h3 className="h4 fw-bold mb-0" style={{ color: "#60a5fa" }}>
                {t("partB")}
              </h3>
            </div>
            <div className="medical-section-body">
              <div className="mb-4 p-3 bg-light rounded">
                <div
                  style={{
                    borderLeft: "4px solid #2563eb",
                    paddingLeft: "16px",
                  }}
                >
<p className="mb-2" style={{ color: "#374151" }}>
  <Trans i18nKey="noteAllZero" ns="crafftQuestionnaire">
    If you answer <strong style={{ color: "#60a5fa" }}>"0 days"</strong> (no use) to <strong>all</strong> of the <strong>PART A QUESTIONS</strong>, please proceed to answer <strong>only the first question</strong> in Part B ("Car").
  </Trans>
</p>
<p className="mb-0" style={{ color: "#374151" }}>
  <Trans i18nKey="noteAnyMore" ns="crafftQuestionnaire">
    If you answer <strong style={{ color: "#60a5fa" }}>1 day or more</strong> to <strong>any</strong> of the <strong>PART A QUESTIONS</strong>, please continue to answer <strong>all 6 CRAFFT questions</strong> in Part B (<strong>Car, Relax, Alone, Forget, Family/Friends, Trouble</strong>).
  </Trans>
</p>
                </div>
              </div>

              {/* Car Question (luôn hiện) */}
              <div
                className="mb-4 p-3"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  borderRadius: "8px",
                }}
              >
<Form.Label className="fw-semibold">
  <Trans i18nKey="car" ns="crafftQuestionnaire">
    1. Have you ever ridden in a <strong style={{ color: "#60a5fa" }}>CAR</strong> driven by someone (including yourself) who was "high" or had been using alcohol or drugs?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>

                <div className="mt-3">
                  {/* Yes ở trên, No ở dưới */}
                  <Form.Check
                    type="radio"
                    name="car"
                    id="car-yes"
                    label={t("yes")}
                    value="Yes"
                    checked={formData.car === "Yes"}
                    onChange={(e) => handleInputChange("car", e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    name="car"
                    id="car-no"
                    label={t("no")}
                    value="No"
                    checked={formData.car === "No"}
                    onChange={(e) => handleInputChange("car", e.target.value)}
                  />
                </div>
                {errors.car && (
                  <div className="text-danger small mt-2">{errors.car}</div>
                )}
              </div>

              {/* Các câu hỏi còn lại chỉ hiện nếu KHÔNG phải all zero */}
              {!isAllZero && (
                <>
                  {/* Relax */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Form.Label className="fw-semibold">
  <Trans i18nKey="relax" ns="crafftQuestionnaire">
    2. Do you ever use alcohol or drugs to <strong style={{ color: "#60a5fa" }}>RELAX</strong>, feel better about yourself, or fit in?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>
                    <div className="mt-3">
                      <Form.Check
                        type="radio"
                        name="relax"
                        id="relax-yes"
                        label={t("yes")}
                        value="Yes"
                        checked={formData.relax === "Yes"}
                        onChange={(e) =>
                          handleInputChange("relax", e.target.value)
                        }
                      />
                      <Form.Check
                        type="radio"
                        name="relax"
                        id="relax-no"
                        label={t("no")}
                        value="No"
                        checked={formData.relax === "No"}
                        onChange={(e) =>
                          handleInputChange("relax", e.target.value)
                        }
                      />
                    </div>
                    {errors.relax && (
                      <div className="text-danger small mt-2">
                        {errors.relax}
                      </div>
                    )}
                  </div>
                  {/* Alone */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Form.Label className="fw-semibold">
  <Trans i18nKey="alone" ns="crafftQuestionnaire">
    3. Do you ever use alcohol or drugs while you are by yourself, or <strong style={{ color: "#60a5fa" }}>ALONE</strong>?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>
                    <div className="mt-3">
                      <Form.Check
                        type="radio"
                        name="alone"
                        id="alone-yes"
                        label={t("yes")}
                        value="Yes"
                        checked={formData.alone === "Yes"}
                        onChange={(e) =>
                          handleInputChange("alone", e.target.value)
                        }
                      />
                      <Form.Check
                        type="radio"
                        name="alone"
                        id="alone-no"
                        label={t("no")}
                        value="No"
                        checked={formData.alone === "No"}
                        onChange={(e) =>
                          handleInputChange("alone", e.target.value)
                        }
                      />
                    </div>
                    {errors.alone && (
                      <div className="text-danger small mt-2">
                        {errors.alone}
                      </div>
                    )}
                  </div>
                  {/* Forget */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
                    <Form.Label className="fw-semibold">
  <Trans i18nKey="forget" ns="crafftQuestionnaire">
    4. Do you ever <strong style={{ color: "#60a5fa" }}>FORGET</strong> things you did while using alcohol or drugs?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>
                    <div className="mt-3">
                      <Form.Check
                        type="radio"
                        name="forget"
                        id="forget-yes"
                        label={t("yes")}
                        value="Yes"
                        checked={formData.forget === "Yes"}
                        onChange={(e) =>
                          handleInputChange("forget", e.target.value)
                        }
                      />
                      <Form.Check
                        type="radio"
                        name="forget"
                        id="forget-no"
                        label={t("no")}
                        value="No"
                        checked={formData.forget === "No"}
                        onChange={(e) =>
                          handleInputChange("forget", e.target.value)
                        }
                      />
                    </div>
                    {errors.forget && (
                      <div className="text-danger small mt-2">
                        {errors.forget}
                      </div>
                    )}
                  </div>
                  {/* Family */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
<Form.Label className="fw-semibold">
  <Trans i18nKey="family" ns="crafftQuestionnaire">
    5. Do your <strong style={{ color: "#60a5fa" }}>FAMILY or FRIENDS</strong> ever tell you that you should cut down on your drinking or drug use?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>
                    <div className="mt-3">
                      <Form.Check
                        type="radio"
                        name="family"
                        id="family-yes"
                        label={t("yes")}
                        value="Yes"
                        checked={formData.family === "Yes"}
                        onChange={(e) =>
                          handleInputChange("family", e.target.value)
                        }
                      />
                      <Form.Check
                        type="radio"
                        name="family"
                        id="family-no"
                        label={t("no")}
                        value="No"
                        checked={formData.family === "No"}
                        onChange={(e) =>
                          handleInputChange("family", e.target.value)
                        }
                      />
                    </div>
                    {errors.family && (
                      <div className="text-danger small mt-2">
                        {errors.family}
                      </div>
                    )}
                  </div>
                  {/* Trouble */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      borderRadius: "8px",
                    }}
                  >
<Form.Label className="fw-semibold">
  <Trans i18nKey="trouble" ns="crafftQuestionnaire">
    6. Have you ever gotten into <strong style={{ color: "#60a5fa" }}>TROUBLE</strong> while you were using alcohol or drugs?
  </Trans>
  <span className="required-asterisk">*</span>
</Form.Label>
                    <div className="mt-3">
                      <Form.Check
                        type="radio"
                        name="trouble"
                        id="trouble-yes"
                        label={t("yes")}
                        value="Yes"
                        checked={formData.trouble === "Yes"}
                        onChange={(e) =>
                          handleInputChange("trouble", e.target.value)
                        }
                      />
                      <Form.Check
                        type="radio"
                        name="trouble"
                        id="trouble-no"
                        label={t("no")}
                        value="No"
                        checked={formData.trouble === "No"}
                        onChange={(e) =>
                          handleInputChange("trouble", e.target.value)
                        }
                      />
                    </div>
                    {errors.trouble && (
                      <div className="text-danger small mt-2">
                        {errors.trouble}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div
            className="d-flex justify-content-center mt-4 p-4"
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid rgba(59, 130, 246, 0.1)",
            }}
          >
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? t("submitting") : t("submit")}
            </Button>
          </div>
        </Form>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default CrafftQuestionnaire;
