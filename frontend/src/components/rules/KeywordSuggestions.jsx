import React, { useState, useEffect } from "react";
import { checkKeywordSuggestions } from "../../api/client";

export default function KeywordSuggestions({
  keywords,
  ledgerType,
  onSuggestionSelect,
  onKeywordsChange,
  inputRef, // Thêm ref của input keywords
}) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);

  // Thêm effect để lắng nghe blur event
  useEffect(() => {
    const handleBlur = () => {
      // Ẩn cảnh báo khi blur khỏi input keywords
      setTimeout(() => {
        setShowWarnings(false);
      }, 200); // Delay nhỏ để tránh ẩn quá nhanh khi click vào suggestion
    };

    const handleFocus = () => {
      // Hiện lại cảnh báo khi focus vào input keywords
      if (suggestions && suggestions.hasTypos) {
        setShowWarnings(true);
      }
    };

    if (inputRef && inputRef.current) {
      inputRef.current.addEventListener("blur", handleBlur);
      inputRef.current.addEventListener("focus", handleFocus);
    }

    return () => {
      if (inputRef && inputRef.current) {
        inputRef.current.removeEventListener("blur", handleBlur);
        inputRef.current.removeEventListener("focus", handleFocus);
      }
    };
  }, [inputRef, suggestions]);

  // Kiểm tra gợi ý khi keywords thay đổi
  useEffect(() => {
    if (keywords && keywords.trim()) {
      checkSuggestions();
    } else {
      setSuggestions(null);
      setShowWarnings(true); // Reset warning state khi không có keywords
    }
  }, [keywords, ledgerType]);

  const checkSuggestions = async () => {
    if (!keywords || !keywords.trim()) return;

    setLoading(true);
    try {
      const { data } = await checkKeywordSuggestions({
        keywords: keywords.trim(),
        ledgerType,
      });
      setSuggestions(data);

      // Ẩn cảnh báo nếu không có lỗi chính tả
      if (!data.hasTypos) {
        setShowWarnings(false);
      } else {
        setShowWarnings(true);
      }
    } catch (error) {
      console.error("Error checking suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const replaceKeyword = (original, replacement) => {
    const keywordList = keywords.split("|").map((k) => k.trim());
    const index = keywordList.findIndex((k) => k === original);
    if (index !== -1) {
      keywordList[index] = replacement;
      const newKeywords = keywordList.join(" | ");
      if (onKeywordsChange) {
        onKeywordsChange(newKeywords);
      }
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ color: "#6b7280", fontSize: 13 }}>
          🔍 Đang kiểm tra từ khóa...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Cảnh báo lỗi chính tả */}
      {suggestions && suggestions.hasTypos && showWarnings && (
        <div style={warningBoxStyle}>
          <div style={warningHeaderStyle}>Có thể có lỗi chính tả</div>
          {suggestions.results
            .filter((result) => result.isLikelyTypo)
            .map((result, index) => (
              <div key={index} style={suggestionItemStyle}>
                <div style={originalWordStyle}>"{result.original}"</div>
                <div style={suggestionListStyle}>
                  Có thể bạn muốn viết:
                  {result.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        replaceKeyword(result.original, suggestion.keyword)
                      }
                      style={suggestionButtonStyle}
                      title={suggestion.reason}
                    >
                      {suggestion.keyword}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function getLedgerTypeLabel(ledgerType) {
  const labels = {
    CHI_PHI: "Chi phí",
    DOANH_THU: "Doanh thu",
    TAI_SAN: "Tài sản",
    CONG_NO: "Công nợ",
  };
  return labels[ledgerType] || "Không xác định";
}

// Styles
const containerStyle = {
  marginTop: 8,
  fontSize: 13,
};

const warningBoxStyle = {
  background: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: 6,
  padding: 12,
  marginBottom: 12,
};

const warningHeaderStyle = {
  fontWeight: 600,
  color: "#92400e",
  marginBottom: 8,
};

const suggestionItemStyle = {
  marginBottom: 8,
};

const originalWordStyle = {
  fontWeight: 600,
  color: "#dc2626",
  marginBottom: 4,
};

const suggestionListStyle = {
  color: "#374151",
  marginBottom: 4,
};

const suggestionButtonStyle = {
  background: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "4px 8px",
  margin: "2px 4px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};
