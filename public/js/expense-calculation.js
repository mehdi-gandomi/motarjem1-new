var svgLoader = "  <svg version='1.1' id='L9' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'x='0px' y='0px' viewBox='0 0 100 100' enable-background='new 0 0 0 0' xml:space='preserve'><path fill=' #8D8F8E' d='M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50'><animateTransform attributeName='transform' attributeType='XML' type='rotate' dur='1s' from='0 50 50'to='360 50 50' repeatCount='indefinite' /></path></svg>";
var couponCodeEntered={
    isValid:false,
    isPercentBased:false,
    percent:0,
    price:0,
    minPrice:0
};


function calculatePrice(translate_language, type, delivery_type, wordsNumber) {
    var goldBasePrice = 0;
    var silverBasePrice = 0;
    var goldFinalPrice = 0;
    var silverFinalPrice = 0;
    var coefficient = 1;
    var baseDuration = 1;
    var page_number = Math.round(wordsNumber / 250);
    if (page_number < 1)
        page_number = 1;


    if (translate_language == "en_to_fa") {
        if (type == "common") {
            goldBasePrice = 32;
            silverBasePrice = 20;

        } else if (type == "specialist") {
            goldBasePrice = 44;
            silverBasePrice = 40;
        }

    } else if (translate_language == "fa_to_en") {


        if (type == "common") {
            goldBasePrice = 40;
            silverBasePrice = 32;

        } else if (type == "specialist") {
            goldBasePrice = 60;
            silverBasePrice = 52;
        }

    }
    goldFinalPrice = wordsNumber * goldBasePrice;
    silverFinalPrice = wordsNumber * silverBasePrice;

    if (delivery_type == "normal") { coefficient = 1; baseDuration = 5; }

    else if (delivery_type == "half_an_instant") { coefficient = 1.2; baseDuration = 6; }

    else if (delivery_type == "instantaneous") { coefficient = 1.5; baseDuration = 8; }
    goldFinalPrice = goldFinalPrice * coefficient;
    silverFinalPrice = silverFinalPrice * coefficient;
    var durend = page_number / baseDuration;
    if (couponCodeEntered.isValid){
        if (goldFinalPrice >= couponCodeEntered.minPrice){
            if (couponCodeEntered.isPercentBased){
                goldFinalPrice=goldFinalPrice - Math.ceil((goldFinalPrice*parseFloat(couponCodeEntered.percent))/100)
            }else{
                goldFinalPrice=goldFinalPrice-parseInt(couponCodeEntered.price);
            }
        }
        if (silverFinalPrice >= couponCodeEntered.minPrice){
            if (couponCodeEntered.isPercentBased){
                silverFinalPrice=silverFinalPrice - Math.ceil((silverFinalPrice*parseFloat(couponCodeEntered.percent))/100)
            }else{
                silverFinalPrice=silverFinalPrice-parseInt(couponCodeEntered.price);
            }
        }
    }
    durend = Math.ceil(durend)

    return {
        "goldPrice": goldFinalPrice,
        "silverPrice": silverFinalPrice,
        "duration": durend,
        "pageNumber": page_number
    }

}
function printValidationHint(el, value, className,addClass){
    if(addClass===undefined){
        addClass=true;
    }
    if (typeof el != "object") {
        el = select(el);
    }


    el.innerHTML=value;


    if(addClass){
        el.classList.add(className);
    }else{
        el.classList.remove(className);
    }
}
function validate_words(e) {
    var words = e.target.value;
    var hint = select(".words--hint");
    if(words < 0 || words==0){
        e.target.value="";
    }
    if(words==""){
        e.target.classList.add("validation-failed");
        printValidationHint(hint,"این فیلد نباید خالی بماند","validation-failed-hint");
    }
    else if (words < 250) {
        e.target.classList.add("validation-failed");
        printValidationHint(hint,"تعداد کلمات نباید کمتر از 250 باشد!","validation-failed-hint");
    }
    else {
        e.target.classList.remove("validation-failed");
        printValidationHint(hint,"","validation-failed-hint",false);
        validationError("hide");
    }
}
function validate_discount_code(e) {
    const discountHint=select("#discountHint");
    if (e.target.value == ""){
        couponCodeEntered.isValid=false;
        discountHint.classList.remove("validation-failed");
        discountHint.innerHTML="جهت دریافت کد تخفیف <a href=\"http://www.t.me/motarjem_one\">پیام</a> دهید";
    } else{
        axios.get('order/discount-code/validate', {
            params: {
                coupon_code: e.target.value
            }
        })
            .then(function (response) {
                if (response.data.valid){
                    couponCodeEntered.isValid=true;
                    couponCodeEntered.minPrice=response.data.info.min_price;
                    if (response.data.info.is_percent_based){
                        couponCodeEntered.isPercentBased=true;
                        couponCodeEntered.percent=response.data.info.discount_percent;
                        discountHint.classList.remove("validation-failed");
                        discountHint.innerHTML="کد تخفیف تایید شد ! "+response.data.info.discount_percent+"% تخفیف";
                        return true;
                    }
                    couponCodeEntered.isPercentBased=false;
                    couponCodeEntered.price=parseInt(response.data.info.discount_price);
                    discountHint.classList.remove("validation-failed");
                    discountHint.innerHTML="کد تخفیف تایید شد ! "+parseInt(response.data.info.discount_price).toLocaleString("us")+ "تومان";
                    return true;
                }else{
                    couponCodeEntered.isValid=false;
                    discountHint.innerHTML="کد تخفیف وارد شده یافت نشد !";
                    discountHint.classList.add("validation-failed");
                    return false;
                }
            })
            .catch(function (error) {
                console.log(error);
            })
    }
}

addListener("#discount","blur",validate_discount_code);

addListener("#words","keyup",validate_words);
addListener("#type", "change", function (e) {
    var kind = e.target.value;
    if (kind == "specialist") {
        select(".field_of_study").classList.add("show");
    } else {
        select(".field_of_study").classList.remove("show");
    }
})

addListener("#calc", "click", function (e) {
    e.preventDefault();
    const words = select("#words");
    var wordsNumber = parseInt(words.value);
    var wordsAlert = select(".words--hint");
    var goldQualityResult = select(".calculate-result__gold .result");
    var silverQualityResult = select(".calculate-result__silver .result");
    var orderButton = select("#order");

    var calcInfo = select(".calculate-result__info");
    if (wordsNumber == 0 || isNaN(wordsNumber)) {
        alert("لطفا فیلدهای مورد نیاز را پر کنید");
        return;
    }

    if (wordsNumber < 250) {
        words.classList.add("input-error");
        wordsAlert.innerHTML = "تعداد کلمات نباید کمتر از 250 باشد!";
        wordsAlert.style.color="red";
        return;
    }
    words.classList.remove("input-error");
    wordsAlert.innerHTML = "هر صفحه استاندارد، 250 کلمه است";
    wordsAlert.style.color="#000";
    goldQualityResult.innerHTML = svgLoader;
    silverQualityResult.innerHTML = svgLoader;
    select(".calculate-result").classList.add("show");
    var type = select("#type").value;
    var translate_language = select('#language').value;
    var delivery_type = select('#delivery_type').value;
    ////////
    var result = calculatePrice(translate_language, type, delivery_type, wordsNumber);

    calcInfo.innerHTML = "تعداد صفحات : " + result.pageNumber;
    setTimeout(function () {
        silverQualityResult.innerHTML = result.silverPrice + ' تومان در مدت ' + result.duration + " روز";
        goldQualityResult.innerHTML = result.goldPrice + ' تومان در مدت ' + result.duration + " روز";
        orderButton.classList.remove("d-none");
    }, 1000);



});


// function checkOrderForm() {
//     var wordsNumber = $('#wordsNumber').val();
//     if (wordsNumber == "") {
//         $('#mess').html('<h5 class="alert alert-danger">فرم خالی نماند</h5>');
//         $("html, body").animate({ scrollTop: 0 }, 500);
//         return false;
//     }
// }
