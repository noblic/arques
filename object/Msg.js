/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// Msg
//

Msg = function() {
	var This = this;

	This.mAction = 0;
	This.mData1 = 0;
	This.mData2 = 0;
	This.mDurStartTime = 0;
	This.mDur = 0;
}

//
// MsgHandler
//

MsgHandler = function(onAction) {
	var This = this;

	This.mMsgs = [];
	This.mOnAction = onAction;
	This.mIsProcessing = false;
}

MsgHandler.prototype.start = function() {
	var This = this;
	This.mIsProcessing = true;
}

MsgHandler.prototype.stop = function() {
	var This = this;
	This.mIsProcessing = false;
}

MsgHandler.prototype.scheduleMessage = function(action, durMilli, data1, data2) {
	var This = this;
	var r = new Msg();

	r.mAction = action;
	r.mDur = durMilli;
	r.mData1 = data1;
	r.mData2 = data2;
	r.mDurStartTime = ar.tick();

	This.mMsgs.push(r);
}

MsgHandler.prototype.clearMessages = function(action) {
	var This = this;

	if (action == 0) {
		This.mMsgs = [];
		return;
	}

	var toDel = [];

	for (var i = This.mMsgs.length - 1; i >= 0; i--) {
		var r = This.mMsgs[i];

		if (r.mAction == action)
			This.mMsgs.splice(i, 1);
	}
}

MsgHandler.prototype.processMessage = function() {
	var This = this;
	var toRun = [];

	if (This.mIsProcessing == false)
		return;

	for (var i = This.mMsgs.length - 1; i >= 0; i--) {
		var r = This.mMsgs[i];
		var dur = ar.tick() - r.mDurStartTime;

		if (dur >= r.mDur) // r.mDur != 0 &&
		{
			toRun.push(r);
			This.mMsgs.splice(i, 1);
		}
	}

	for (var i = toRun.length - 1; i >= 0; i--)
		This.mOnAction(toRun[i]);

	if (This.mIsProcessing)
		setTimeout(function() {
			This.processMessage()
		}, 1000 / ar.FPS);
}
