var uploadedFiles=[];
//this fucntion replaces all occurances in string with desired value
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, "g"), replacement);
  };
  // this function substitutes placeholders with value given as object
  function substitute(str, data) {
      var output = str.replace(/%[^%]+%/g, function(match) {
          if (match in data) {
              return(data[match]);
          } else {
              return("");
          }
      });
      return(output);
  }
  
  function getQueryString(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
  //this function converts js object to querystring to use on urls
  function serializeQSObject(obj) {
    var str = [];
    for (var p in obj) {
      if (obj[p] == "") continue;
      if (Array.isArray(obj[p]) && obj[p].length < 1) continue;
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    }
  
    return str.join("&").replaceAll("%2C", ",");
  }
  //this function converts querystring to js object to manipulate object
  function queryStringToObj(queryString) {
    if (queryString == "?" || queryString == "") return {};
    return JSON.parse(
      '{"' + queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
      function(key, value) {
        return key === "" ? value : decodeURIComponent(value);
      }
    );
  }

$("input[type=checkbox]").on("change",function(e){
    var state=e.target.checked;
    var queryString="";
    var value=e.target.value;
    var page=getQueryString("page");
    var doneQsFromUrl=getQueryString("done");
    if(doneQsFromUrl && doneQsFromUrl.indexOf(value) < 0 ){
        if(state){
            doneQsFromUrl+=","+value;
        }else{
            doneQsFromUrl=doneQsFromUrl.substring(doneQsFromUrl.indexOf(value),1);
            if(doneQsFromUrl.indexOf(",")) doneQsFromUrl= doneQsFromUrl.substr(0,doneQsFromUrl.length-1);
        }
    }else{
        if(state){
            doneQsFromUrl=value;
        }else{
            doneQsFromUrl=$("input[type=checkbox]:checked").val();
        }
    }
    if(page){
        queryString="?page="+page;
        if(doneQsFromUrl){
            queryString+="&done="+doneQsFromUrl
        }
    }else{
        if(doneQsFromUrl){
            queryString="?done="+doneQsFromUrl;
        }
    }
    window.history.pushState("filtered data","سفارشات شما",window.location.origin+window.location.pathname+queryString);
    getOrdersFromApi(window.location.origin+window.location.pathname,queryString);
})

$("#completedOrderForm").on("submit",function (e) {
   e.preventDefault();
   var $this=$(this);
   var $file=$("#uploaded-files");
   if ($file.val() == ""){
       Swal.fire({
           title: 'خطا',
           text: "باید حداقل یک فایل آپلود کنید !",
           type: 'error',
           confirmButtonText: 'باشه'
       })
   } else{
       Swal.fire({
           title: 'آیا مطمینید ؟',
           text: "از کامل شدن ترجمه مطمین هستید ؟",
           type: 'info',
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           cancelButtonColor: '#d33',
           confirmButtonText: 'بله',
           cancelButtonText:'نه'
       }).then(function(result) {
           if (result.value) {
               $.ajax({
                   type:"POST",
                   url:$this.attr("action"),
                   data:$this.serialize(),
                   success:function(data,status){

                       if(data.status){
                           Swal.fire({
                               title: 'موفق !',
                               text: "اطلاعات با موفقیت ذخیره شد !",
                               type: 'success',
                               confirmButtonColor: '#3085d6',
                               cancelButtonColor: '#d33',
                               confirmButtonText: 'باشه'
                           }).then(function(result){
                               if (result.value) {
                                   window.location.reload();
                               }
                           })
                       }else{
                           Swal.fire(
                               'خطا !',
                               'خطایی در ثبت اطلاعات رخ داد',
                               'error'
                           )
                       }
                   }
               })
           }else{

           }
       })
   }
});

function getOrdersFromApi(baseUrl,queryString){
    $.get(baseUrl+"/json"+queryString,function(data,status){
        console.log(data.orders);
        renderOrders(data.orders);
        showPagination(data.orders_count,data.current_page,10,window.location.origin+window.location.pathname, queryString,3);
    })
}
function setAsCompleted(orderId) {
    $("#orderIdValue").val(orderId);
    $("#completedOrderModal").modal("show");
}
function showOrderInfo(orderNumber){
    $.get("/translator/order/info/"+orderNumber,function(data,status){
        var output="<div class='order-details row'>";
        var translationLang=data.translation_lang=="1" ? "انگلیسی به فارسی":"فارسی به انگلیسی";
        var translationQuality=data.translation_quality == "5" ? "نقره ای":"طلایی";
        var translationKind=data.translation_kind == '1' ? "عمومی":"تخصصی";
        var deliveryType;
        if(data.delivery_type=="1"){
            deliveryType="معمولی";
        }else if(data.delivery_type=="2"){
            deliveryType="نیمه فوری";
        }else{
            deliveryType="فوری";
        }
        output+="<div class='order-details__detail col-md-3'><div class='order-details__detail__label'>شماره سفارش</div><div class='order-details__detail__value'>"+data.order_number+"</div></div>";
        output+="<div class='order-details__detail col-md-3'><div class='order-details__detail__label'>تعداد صفحات</div><div class='order-details__detail__value'>"+Math.ceil(data.word_numbers/250)+"</div></div>";
        output+="<div class='order-details__detail col-md-3'><div class='order-details__detail__label'>زبان ترجمه</div><div class='order-details__detail__value'>"+translationLang+"</div></div>";
        output+="<div class='order-details__detail col-md-3'><div class='order-details__detail__label'>کیفیت ترجمه</div><div class='order-details__detail__value'>"+translationQuality+"</div></div>";
        output+="<div class='order-details__detail col-md-3'><div class='order-details__detail__label'>نوع ترجمه</div><div class='order-details__detail__value'>"+translationKind+"</div></div>";
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>رشته دانشگاهی</div><div class='order-details__detail__value'>"+data.study_field+"</div></div>";
        output+="<div class='order-details__detail col-md-5'><div class='order-details__detail__label'>زمان تحویل</div><div class='order-details__detail__value'>"+deliveryType+"</div></div>";
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>زمان تخمینی برحسب روز</div><div class='order-details__detail__value'>"+data.delivery_days+"</div></div>";
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>نام سفارش دهنده</div><div class='order-details__detail__value'>"+data.orderer_fname+" "+data.orderer_lname+"</div></div>";
        // output+="<div class='order-details__detail col-md-5'><div class='order-details__detail__label'>ایمیل سفارش دهنده</div><div class='order-details__detail__value'>"+data.email+"</div></div>";
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>تاریخ ثبت سفارش</div><div class='order-details__detail__value'>"+data.order_date_persian+"</div></div>";
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>کد تخفیف</div><div class='order-details__detail__value'>"+(data.discount_code ? data.discount_code:"استفاده نشده")+"</div></div>";
        if (data.discount_code){
            output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>قیمت سفارش بدون تخفیف</div><div class='order-details__detail__value'>"+parseInt(data.price_without_discount).toLocaleString("us")+"</div></div>";
        }
        output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>قیمت کل سفارش</div><div class='order-details__detail__value'>"+parseInt(data.order_price).toLocaleString("us")+"</div></div>";
        output+="<div class='order-details__detail col-md-5'><div class='order-details__detail__label'>سهم شما از این سفارش</div><div class='order-details__detail__value'>"+Math.ceil((data.order_price*70)/100).toLocaleString("us")+"</div></div>";
        if(data.description){
            output+="<div class='order-details__detail col-md-8'><div class='order-details__detail__label'>توضیحات</div><div class='order-details__detail__value'>"+data.description+"</div></div>";
        }
        if(data.order_files){
            var files=data.order_files.split(",");
            var filesHtml="";
            files.forEach(function(file){
                filesHtml+="<a style='display:block' href='/public/uploads/order/"+file+"' download='"+file+"'>"+file+"</a>"
            })
            output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>فایل ها</div><div class='order-details__detail__value'>"+filesHtml+"</div></div>";
        }
        if (data.is_done != "0"){
            console.log(data);
            var files=data.completed_order_files.split(",");
            var filesHtml="";
            files.forEach(function(file){
                filesHtml+="<a style='display:block' href='/public/uploads/order/completed/"+file+"' download='"+file+"'>"+file+"</a>"
            })
            output+="<div class='order-details__detail col-md-4'><div class='order-details__detail__label'>فایل های ترجمه شده</div><div class='order-details__detail__value'>"+filesHtml+"</div></div>";
        }
        output+="</div>";
        $("#orderDetailsWrap").html(output);
        $("#orderDetailsModal").modal("show");
    });
    // Swal.fire({
    //     title: '<strong>HTML <u>example</u></strong>',
    //     type: 'info',
    //     html:
    //       'You can use <b>bold text</b>, ' +
    //       '<a href="//github.com">links</a> ' +
    //       'and other HTML tags',
    //     showCloseButton: true,
    //     showCancelButton: true,
    //     focusConfirm: false,
    //     confirmButtonText:
    //       '<i class="fa fa-thumbs-up"></i> Great!',
    //     confirmButtonAriaLabel: 'Thumbs up, great!',
    //     cancelButtonText:
    //       '<i class="fa fa-thumbs-down"></i>',
    //     cancelButtonAriaLabel: 'Thumbs down',
    //   })
  }
function renderOrders(orders){
    var output="";
    $(".OrdersTable thead").css("display","table-header-group");
    for(var index in orders){
        var translationLang=orders[index].translation_lang == "1"? "انگلیسی به فارسی": "فارسی به انگلیسی";
        var translationQuality=orders[index].translation_quality == "5" ? "نقره ای" : "طلایی";
        output+="<tr>";
            output+="<td data-label='شماره سفارش'>"+orders[index].order_number+"</td>";
            output+="<td data-label='تعداد صفحات'>"+Math.ceil(orders[index].word_numbers / 250)+"</td>";
            output+="<td data-label='زبان ترجمه'>"+translationLang+"</td>";
            output+="<td data-label='رشته'>"+orders[index].study_field+"</td>";
            // output+="<td data-label='کیفیت ترجمه'>"+translationQuality+"</td>";
            output+="<td data-label='کد تخفیف'>"+(orders[index].discount_code ? orders[index].discount_code:"استفاده نشده")+"</td>";
            output+="<td data-label='وضعیت'>"+(orders[index].is_done == '0' ? "انجام نشده":"انجام شده")+"</td>";
            output+="<td data-label='هزینه ترجمه'>"+parseInt(orders[index].order_price).toLocaleString("us")+"</td>";
            output+="<td data-label='سهم شما'>"+Math.ceil((orders[index].order_price*70)/100).toLocaleString("us")+"</td>";
            

            output+="<td data-label='عملیات' class='order-actions'> <button onclick='showOrderInfo(\""+ orders[index].order_number+"\")' class='expand-button order-action is--primary is--medium'> <span data-hover='جزییات سفارش'> <i class='icon-info'></i> </span> </button> <button onclick='setAsCompleted(\""+orders[index].order_id+"\")' class='expand-button order-action is--success is--medium'> <span data-hover='اعلام کامل شدن سفارش'> <i class='icon-check'></i> </span> </button> </td>";
            output+="</td>";
        output+="</tr>";
    }

    if(output){
        $("h5.no-data").remove();
        $("#OrdersWrap").html(output);
    }else{
        $(".OrdersTable thead").css("display","none");
        $(".OrdersTable tbody").html("<h5 class='text-center mt-4'>اطلاعاتی دریافت نشد !</h5>");
    }
    
}
  
//this function shows pagination
function showPagination(count,current_page,offset,baseUrl, queryString,visibleNumbers) {
var output="";
var fullUrl;
if(queryString){
    fullUrl=baseUrl+"?"+queryString+"&page=%page%";
}else{
    fullUrl=baseUrl+"?page=%page%";
}
if(count > offset){
    var lastPage=Math.ceil(count/offset);
    var endIndex,startIndex;
    output+=current_page > 1 ? '<li class="page-item"><a class="page-link" href="'+baseUrl+'" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li><li class="page-item"><a class="page-link" href="'+substitute(fullUrl,{"%page%":current_page-1})+'" aria-label="Previous">قبلی</a></li>' : "";
    if((current_page+(visibleNumbers-1)) > lastPage){
        
    endIndex=lastPage;
    startIndex=current_page-(visibleNumbers-(lastPage-current_page));
    }else{

    startIndex=current_page - (visibleNumbers-1);
    startIndex= startIndex<=0 ? 1:startIndex;
    endIndex=current_page+ (visibleNumbers-1);
    }

    for(pageNumber=startIndex;pageNumber<=endIndex;pageNumber++){
    output+= pageNumber==current_page ? "<li class='page-item active'>":"<li class='page-item'>";
    output+="<a class='page-link' href='"+substitute(fullUrl,{"%page%":pageNumber})+"'>"+pageNumber+"</a>";
    }
    if(current_page != lastPage){
    output+='<li class="page-item"><a class="page-link" href="'+substitute(fullUrl,{"%page%":current_page+1})+'" aria-label="Previous">بعدی</a></li>';
    output+='<li class="page-item"><a class="page-link" href="'+substitute(fullUrl,{"%page%":lastPage})+'" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
    }
}
$(".pagination").html(output);
}

FilePond.registerPlugin(

    // encodes the file as base64 data
    FilePondPluginFileEncode,

    // validates the size of the file
    FilePondPluginFileValidateSize,

);

// Select the file input and use create() to turn it into a pond
FilePond.create(
    document.querySelector('#file')
);
FilePond.setOptions({
    // instantUpload: false,
    server: {
        url: '/translator/orders',
        process: {
            url: '/upload-completed-files',
            onload: function (response) {
                uploadedFiles.push(response);
                $("#uploaded-files").val(uploadedFiles.join(","));
                return response.key;
            },
            onerror: function (response) {
                return response.data;
            }
        }
    }
});