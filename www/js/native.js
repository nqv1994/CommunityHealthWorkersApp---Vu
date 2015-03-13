var goBack = function() {
    window.history.back();
};
function modalHeight() {
	// console.log($(ion-content>div.scroll).height());
	console.log("readyyy");
}
$(window).load(function(){
	console.log("ready");
});
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.hide()
}

//Supposed to make LocalStorage Easier
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
};
