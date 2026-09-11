const form = document.getElementById("partnership-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "보내는 중...";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      status.textContent = "문의가 접수되었어요. 빠른 시일 내에 연락드릴게요!";
      status.className = "form-status success";
    } else {
      status.textContent = "전송에 실패했어요. 잠시 후 다시 시도해주세요.";
      status.className = "form-status error";
    }
  } catch (err) {
    status.textContent = "네트워크 오류로 전송하지 못했어요. 잠시 후 다시 시도해주세요.";
    status.className = "form-status error";
  } finally {
    status.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "문의 보내기";
  }
});
