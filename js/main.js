function $(id) {
	return document.querySelector(id);
}

//画像アップロード用
$("#afile").onchange = function(evt){
	var files = evt.target.files;
	if(files.length == 0) return;
	var file = files[0];
	if(!file.type.match(/image/)) {
		alert('画像ファイルを選んでください');
		return;
	}
	if(10240000 < file.size){
		alert('画像が大きすぎます(10MBまで)');
		return;
	};
	var reader = new FileReader();
	reader.onload = function(evt) {
		var userImg = new Image();
		userImg.src = reader.result;
		if(userImg.width == 0)reader.readAsDataURL(file);
		else {
			$("#beforeImg").src=userImg.src;
			imgOutput(userImg);
	 	}
	}
	reader.readAsDataURL(file);
}

function imgOutput(originImg){
	console.log(originImg.width*originImg.height);
	if(originImg.width*originImg.height > 102400){
		$("#sizeNotice").style.display="block";
		$("#afterImg").src=imgTrans(imgResize(originImg,originImg.width/2,originImg.height/2),"2").src;
	} else {
		$("#sizeNotice").style.display="none";
		$("#afterImg").src=imgTrans(originImg,"2").src;
	}
}

//画像をグレースケール等に変更する関数
function imgTrans(originImg,pattern) {
	var Tcanvas = document.createElement('canvas');
	Tcanvas.width = originImg.width;
	Tcanvas.height = originImg.height;
	var Tcontext = Tcanvas.getContext('2d');
	Tcontext.drawImage(originImg, 0, 0);
	var originImgData = Tcontext.getImageData(0, 0, originImg.width, originImg.height);
	var afterImgData = Tcontext.createImageData(originImg.width, originImg.height);

	switch (pattern){
		case "0":
		//デバッグ用：そのまま出力
			for(var i = 0; i < originImgData.data.length; i=i+1){
		 	   afterImgData.data[i] = originImgData.data[i];
			}
			break;
		case "1":
		//simple grayscale
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = originImgData.data[i];
		 	   var g = originImgData.data[i+1];
		 	   var b = originImgData.data[i+2];
		 	   var gray = (r+g+b)/3;
		 	   afterImgData.data[i] = gray;
		 	   afterImgData.data[i+1] = gray;
		 	   afterImgData.data[i+2] = gray;
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "2":
		//gray scale
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = 0.2126*originImgData.data[i];
		 	   var g = 0.7152*originImgData.data[i+1];
		 	   var b = 0.0722*originImgData.data[i+2];
		 	   var gray = parseInt(r+g+b);
		 	   afterImgData.data[i] = gray;
		 	   afterImgData.data[i+1] = gray;
		 	   afterImgData.data[i+2] = gray;
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "3":
		//ネガポジ変換
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   afterImgData.data[i] = 255 - originImgData.data[i];
		 	   afterImgData.data[i+1] = 255 - originImgData.data[i+1];
		 	   afterImgData.data[i+2] = 255 - originImgData.data[i+2];
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
	}
	
	Tcontext.putImageData(afterImgData, 0, 0);
	var afterImg = new Image();
	afterImg.src = Tcanvas.toDataURL();
	return afterImg;
}

//指定サイズにリサイズする関数 :縦で長かった場合は下を切る、横の場合は真ん中を使う
function imgResize(originImg,rWidth,rHeight){
	var Rcanvas = document.createElement('canvas');
	Rcanvas.width = rWidth;
	Rcanvas.height = rHeight;
	var Rcontext = Rcanvas.getContext('2d');
	if(rHeight/rWidth < originImg.height/originImg.width){
		//画像の下を切ってリサイズ
		Rcontext.drawImage(originImg, 0, 0, originImg.width,parseInt(rHeight/rWidth*originImg.width), 0, 0, rWidth, rHeight);
	} else {
		//画像の左右を切ってリサイズ
		Rcontext.drawImage(originImg, parseInt(originImg.width/2-rWidth/rHeight*originImg.height/2), 0, parseInt(rWidth/rHeight*originImg.height),originImg.height, 0, 0, rWidth, rHeight);										
	}
	var afterImg = new Image();
	afterImg.src = Rcanvas.toDataURL();
	return afterImg;
}
