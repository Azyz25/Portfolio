document.getElementById("button-inp").addEventListener("click", function() {
    // جلب القيم من الحقول
    let field1 = document.getElementById("text-message").value;
    let field2 = document.getElementById("text-name").value;

    // نص الرسالة الثابتة مع الحقول
    let message = "هذه رسالة مخصصة من الموقع:\n" + 
                  "النص الأول: " + field1 + "\n" + 
                  "النص الثاني: " + field2 + "\n" + 
                  "النص الثالث: " + field3;

    // ترميز الرسالة بشكل صحيح للرابط
    let encodedMessage = encodeURIComponent(message);

    // بناء رابط الواتساب مع الرقم الدولي والرسالة
    let whatsappLink = "https://wa.me/966511038120?text=" + encodedMessage;

    // توجيه المستخدم إلى الواتساب
    window.open(whatsappLink, "_blank");
});