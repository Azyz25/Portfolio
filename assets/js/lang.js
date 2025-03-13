// اقرأ الرابط
let path = window.location.pathname;

// جهّز النصوص باللغتين مع أسماء الخطوط
let content = {
    ar: {
        home__title: ` هلا<br>أنا <span class="home__title-color">عبدالعزيز</span><br> `,
        subtitle: "( مطور مواقع )",
        font: "'Scheherazade New', serif" // الخط العربي
    },
    en: {
        home__title: "Welcome to my website",
        subtitle: "( Web Developer )",
        font: "'Poppins', sans-serif" // الخط الإنجليزي
    }
};

// حدد اللغة الافتراضية (عربي)
let lang = "ar";

// تأكد من اللغة في الرابط
if (path.includes("/ar")) {
    lang = "ar";
} else if (path.includes("/en")) {
    lang = "en";
}

// عدّل النصوص والخط
document.addEventListener("DOMContentLoaded", function () {
    // تغيير النص باستخدام innerHTML بدلاً من innerText
    document.querySelector(".home_title").innerHTML = content[lang].hometitle; // استخدم .home_title بدل id

    // تغيير العنوان الفرعي (إذا كان موجود)
    document.querySelector(".title-div h4").innerText = content[lang].subtitle;

    // تغيير اتجاه النص إذا كان عربي
    if (lang === "ar") {
        document.body.style.direction = "rtl";
        document.body.style.textAlign = "right";
    } else {
        document.body.style.direction = "ltr";
        document.body.style.textAlign = "left";
    }

    // تغيير الخط باستخدام متغير CSS
    document.documentElement.style.setProperty("--body-font", content[lang].font);
});