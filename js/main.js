var userImg = new Image();
userImg.src="img/lena.png";
var loadImg = new Image();
loadImg.src="img/loading.gif";
userImg.onload = function(evt){
	$("#beforeImg").src=userImg.src;
	imgOutput(userImg,"1");
}

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
		userImg.src = reader.result;
		if(userImg.width == 0)reader.readAsDataURL(file);
		else {
			$("#beforeImg").src=userImg.src;
			imgOutput(userImg);
	 	}
	}
	reader.readAsDataURL(file);
}

function imgOutput(originImg,pattern){
	$("#afterImg").src=loadImg.src;

	if(originImg.width*originImg.height > 1024000){
		$("#sizeNotice").style.display="block";
		originImg = imgResize(originImg,originImg.width/2,originImg.height/2);
	} else {
		$("#sizeNotice").style.display="none";
	}
	switch (pattern){
		case "4":		//threshold
		var value = $("#thresholdValue").value;
		break;

		case "5":		//AboveFilter
			var value = new Array(9);
			for(var i = 0; i < value.length; i++)value[i] = parseFloat($("#filterValue" + i).value);
		break;

		case "6":		//ShapenFilter
			var value = new Array(0,-1,0,-1,5,-1,0,-1,0);
			pattern = "5";
		break;

		case "7":		//Segment GrayScale
			var value = $("#segmentGrayValue").value;
		break;
		case "8":		//Segment Color
			var value = $("#segmentColorValue").value;
		break;
		case "9":		//ColorFilter
			var value = [$("#colorFilterValueRL").value,$("#colorFilterValueRU").value,$("#colorFilterValueGL").value,$("#colorFilterValueGU").value,$("#colorFilterValueBL").value,$("#colorFilterValueBU").value];
		break;
		case "10":		//Like SobelFilter
			var value = new Array(-3,0,3,-5,0,5,-3,0,3);
			originImg = imgTrans(originImg,'5',value);
			originImg.onload = function(evt) {
				$("#afterImg").src=imgTrans(originImg,"4",127).src;
			}
			return 0;
		break;
		case "11":		//Smoothing
			var value = new Array(0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11);
			pattern = "5";
		break;
		case "12":		//mosaic
			var value = $("#mosaicValue").value;
		break;
		case "13":		//rowFrequensy
			var value = parseInt($("#rowFrequensyValue").value);
		break;
	}
	$("#afterImg").src=imgTrans(originImg,pattern,value).src;
}

//画像をグレースケール等に変更する関数
function imgTrans(originImg,pattern,value) {
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
		case "4":
		//２値化 threshold
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = originImgData.data[i];
		 	   var g = originImgData.data[i+1];
		 	   var b = originImgData.data[i+2];
		 	   if(value<parseInt((r+g+b)/3))var gray = 255;
		 	   else var gray = 0;
		 	   afterImgData.data[i] = gray;
		 	   afterImgData.data[i+1] = gray;
		 	   afterImgData.data[i+2] = gray;
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "5":
		//AboveFilter
			for(var x = 0; x < Tcanvas.width; x++){
				for(var y = 0; y < Tcanvas.height; y++){
				   	var cp = (y*Tcanvas.width+x)*4; //currentPixel
					for(var k = 0; k < 4; k++){
					   	var t = 0;
						var cpc = cp + k;//currentPixelColor
						if(k == 3)afterImgData.data[cpc] = originImgData.data[cpc];//alphaの場合は元の値を固定で入れる
						else {
							var currentPixelValue = 0;
							for(var i = -1; i < 2; i++){
								for(var j = -1; j < 2; j++){
									currentPixelValue = currentPixelValue + originImgData.data[cpc+i*4+j*4*Tcanvas.width]*value[t];
									t++;
								}
							};
							afterImgData.data[cpc] = parseInt(currentPixelValue);
						}
					}
			 	}
			}
			break;
		case "7":
		//Segment GrayScale
			value = value -1 ;
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = 0.2126*originImgData.data[i];
		 	   var g = 0.7152*originImgData.data[i+1];
		 	   var b = 0.0722*originImgData.data[i+2];
		 	   var average = parseInt(r+g+b);
		 	   var gray = parseInt((Math.round(average/ Math.round(255/value))) * Math.round(255/value));
		 	   afterImgData.data[i] = gray;
		 	   afterImgData.data[i+1] = gray;
		 	   afterImgData.data[i+2] = gray;
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "8":
		//Segment Color
			value = value -1 ;
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = originImgData.data[i];
		 	   var g = originImgData.data[i+1];
		 	   var b = originImgData.data[i+2];
		 	   afterImgData.data[i] = parseInt((Math.round(r/ Math.round(255/value))) * Math.round(255/value));
		 	   afterImgData.data[i+1] = parseInt((Math.round(g/ Math.round(255/value))) * Math.round(255/value));;
		 	   afterImgData.data[i+2] = parseInt((Math.round(b/ Math.round(255/value))) * Math.round(255/value));;
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "9":
		//Color Filter
			for(var i = 0; i < originImgData.data.length; i+=4){
		 	   var r = originImgData.data[i];
		 	   var g = originImgData.data[i+1];
		 	   var b = originImgData.data[i+2];
		 	   if((value[0]<r)&&(r<value[1])&&(value[2]<g)&&(g<value[3])&&(value[4]<b)&&(b<value[5])){
			 	   afterImgData.data[i] = originImgData.data[i];
			 	   afterImgData.data[i+1] = originImgData.data[i+1];
			 	   afterImgData.data[i+2] = originImgData.data[i+2];
		 	   } else {
			 	   var gray = parseInt((r+g+b)/3);
			 	   afterImgData.data[i] = gray;
			 	   afterImgData.data[i+1] = gray;
			 	   afterImgData.data[i+2] = gray;
			 	}
		 	   afterImgData.data[i+3] = originImgData.data[i+3];
			}
			break;
		case "12":
		//mosaic
			for(var x = 0; x < Tcanvas.width; x = x + parseInt(value)){
				for(var y = 0; y < Tcanvas.height; y = y + parseInt(value)){
				   	var cp = (y*Tcanvas.width+x)*4; //currentPixel
					var averageValueR = 0;
					var averageValueG = 0;
					var averageValueB = 0;
					for(var i = 0; i < value; i++){
						for(var j = 0; j < value; j++){
							averageValueR = averageValueR + originImgData.data[cp+i*4+j*4*Tcanvas.width];
							averageValueG = averageValueG + originImgData.data[cp+1+i*4+j*4*Tcanvas.width];
							averageValueB = averageValueB + originImgData.data[cp+2+i*4+j*4*Tcanvas.width];
						}
					}

					averageValueR = parseInt(averageValueR / (value * value));
					averageValueG = parseInt(averageValueG / (value * value));
					averageValueB = parseInt(averageValueB / (value * value));

					for(var i = 0; i < value; i++){
						for(var j = 0; j < value; j++){
							afterImgData.data[cp+i*4+j*4*Tcanvas.width] = averageValueR;
							afterImgData.data[cp+1+i*4+j*4*Tcanvas.width] = averageValueG;
							afterImgData.data[cp+2+i*4+j*4*Tcanvas.width] = averageValueB;
							afterImgData.data[cp+3+i*4+j*4*Tcanvas.width] = originImgData.data[cp+3+i*4+j*4*Tcanvas.width];
						}
					}
			 	}
			}
			break;
			case "13":
			//row freauensy
				for(var x = 0; x < Tcanvas.width; x++){
					for(var y = 0; y < Tcanvas.height; y++){
				   	var cp = (y*Tcanvas.width+x)*4; //currentPixel

						averageValueR = (originImgData.data[cp+4] + originImgData.data[cp+4*Tcanvas.width] + originImgData.data[cp+4+4*Tcanvas.width])/3-originImgData.data[cp];
						averageValueG = (originImgData.data[cp+1+4] + originImgData.data[cp+1+4*Tcanvas.width] + originImgData.data[cp+1+4+4*Tcanvas.width])/3-originImgData.data[cp+1];
						averageValueB = (originImgData.data[cp+2+4] + originImgData.data[cp+2+4*Tcanvas.width] + originImgData.data[cp+2+4+4*Tcanvas.width])/3-originImgData.data[cp+2];

						averageValue = parseInt((averageValueR + averageValueG + averageValueB)/3+value);
						if(averageValue>255)averageValue = 255;

						afterImgData.data[cp] = averageValue;
						afterImgData.data[cp+1] = averageValue
						afterImgData.data[cp+2] = averageValue;
						afterImgData.data[cp+3] = originImgData.data[cp+3];
				 	}
				}

				var maxValue = 0;
				for(var x = 0; x < Tcanvas.width; x++){
					for(var y = 0; y < Tcanvas.height; y++){
						var cp = (y*Tcanvas.width+x)*4; //currentPixel
						for(var i=0;i<3;i++)if(maxValue<afterImgData.data[cp+i])maxValue = afterImgData.data[cp+i];
					}
				}

				for(var x = 0; x < Tcanvas.width; x++){
					for(var y = 0; y < Tcanvas.height; y++){
						var cp = (y*Tcanvas.width+x)*4; //currentPixel
						for(var i=0;i<3;i++)afterImgData.data[cp+i] = parseInt(afterImgData.data[cp+i] * 255 /maxValue);
					}
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

//画像を90度回転する。
function imgRotate(originImg){
	var Rcanvas = document.createElement('canvas');
	Rcanvas.width = originImg.height;
	Rcanvas.height = originImg.width;
	var Rcontext = Rcanvas.getContext('2d');

	Rcontext.rotate(180/360*Math.PI);
    Rcontext.drawImage(originImg, 0, -originImg.height);

	userImg.src = Rcanvas.toDataURL();
	return 0;
}

function displayHistogram(){
	$("#beforeHisto").src = makeHistogram($("#beforeImg")).src;
	$("#afterHisto").src = makeHistogram($("#afterImg")).src;
}

//画像からヒストグラムを作成する関数
function makeHistogram(originImg) {
	var histHeight = 80;
	var Tcanvas = document.createElement('canvas');
	Tcanvas.width = originImg.width;
	Tcanvas.height = originImg.height;
	var Tcontext = Tcanvas.getContext('2d');
	Tcontext.drawImage(originImg, 0, 0);
	var originImgData = Tcontext.getImageData(0, 0, originImg.width, originImg.height);

	Tcanvas.width = 256;
	Tcanvas.height = histHeight * 3;

	var histData = new Array(3);
	for(j = 0; j < 3; j++){
		histData[j] = new Array(256);
		for(i = 0; i < 256; i++)
			histData[j][i] = 0;
	}

	for(var i = 0; i < originImgData.data.length; i+=4)
		for(j = 0; j < 3; j++)
			histData[j][originImgData.data[i+j]]++;

	var maxColor = [0,0,0];

	for(i=0; i< 256;i++)
		for(j = 0; j < 3; j++)
			if(maxColor[j] < histData[j][i])
				maxColor[j] =histData[j][i];

	for(i=0; i< 256;i++)
		for(j = 0; j < 3; j++)
			histData[j][i] = histData[j][i] / (maxColor[j]/histHeight);

	for(i=0; i< 256;i++){
		Tcontext.fillStyle = 'rgba(' + i + ', 0, 0, 1)';
		Tcontext.fillRect(i,histHeight,1,-histData[0][i]);
		Tcontext.fillStyle = 'rgba(0, '+ i +', 0, 1)';
		Tcontext.fillRect(i,histHeight*2,1,-histData[1][i]);
		Tcontext.fillStyle = 'rgba(0, 0, '+ i +', 1)';
		Tcontext.fillRect(i,histHeight*3,1,-histData[2][i]);
	}

	var afterImg = new Image();
	afterImg.src = Tcanvas.toDataURL();
	return afterImg;
}
