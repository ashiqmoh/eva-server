//--- Images have to be cached first before creating PDFs ---//
//--- without caching the image, PDF won't be rendered properly ---//
//--- Images.cache() will be called from ResultsPdf.generate() and StatisticsPdf.generate() ---//
var Images = {};

Images.logoPdf = null;

Images.cache = function(callback, args1, args2)
{
	Images.logoPdf = new Image();
	Images.logoPdf.onload = function ()
	{
		callback(args1, args2);
	};
	Images.logoPdf.src = "../img/hfu_logo_small.png";
};
