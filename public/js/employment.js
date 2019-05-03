
document.addEventListener('DOMContentLoaded', function (e) {




    FilePond.registerPlugin(

        // encodes the file as base64 data
        FilePondPluginFileEncode,

        // validates the size of the file
        FilePondPluginFileValidateSize,
        FilePondPluginFileValidateType

    );

    // Select the file input and use create() to turn it into a pond
    var userPhoto=FilePond.create(document.querySelector('#user_photo'),{
        acceptedFileTypes: ['image/jpg','image/jpeg'],
        labelFileTypeNotAllowed:"فرمت فایل باید jpg باشد !"
        // fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
        //
        //     // Do custom type detection here and return with promise
        //
        //     resolve(type);
        // })
    });
    userPhoto.setOptions({
        // instantUpload: false,
        server: {
            url: '/',
            process: {
                url: 'upload-employee-photo',
                onload: function (response) {
                    select("#user_photo_uploaded").value=response;
                    return response.data;
                },
                onerror: function (response) {
                    return response.data;
                }
            }
        }
    });
    console.log(userPhoto);

    var meliCard=FilePond.create(document.querySelector('#meli_card_photo'),{
        acceptedFileTypes: ['image/jpg','image/jpeg'],
        labelFileTypeNotAllowed:"فرمت فایل باید jpg باشد !"
        // fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {
        //
        //     // Do custom type detection here and return with promise
        //
        //     resolve(type);
        // })
    });
    meliCard.setOptions({
        // instantUpload: false,
        server: {
            url: '/',
            process: {
                url: 'upload-employee-melicard',
                onload: function (response) {
                    select("#melicard_photo_uploaded").value=response;
                    return response.key;
                },
                onerror: function (response) {
                    return response.data;
                }
            }
        }
    });

});

addListener("#reload-captcha","click",function(e){
    e.preventDefault();
    
    fetch("/new-captcha")
        .then(function(res){
            return res.json();
        })
        .then(function(res){
            console.log(res);
            select("#captcha").setAttribute("src",res.captcha);
        });
});