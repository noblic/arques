/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

//
// Scroll
//
Scroll = function(opt) {
	var This = this;

	This.opt = opt;
	This.M_PI_2 = 1.57079632679489661923;
	This.SSMSG_SCROLL = 0x0010;
	This.SSMSG_SCROLL_T = 0x0200;
	This.SSMSG_SCROLL_T_FIX = 0x0210;
	This.BOUNCE_SPEED = 1.15;
	This.ELASTICITY = 0.43;
	This.BOUNCE_ELASTICITY = 4.;
	This.SPEED_FACTOR = 0.135;
	This.mMvQueue = [];
	This.mMsgHandler = new MsgHandler(function(m) {
		This.onAction(m)
	});

	// ELASTICITY: 당겨지는 비율. 클수록 잘 당겨진다.
	// BOUNCE_SPEED: 스크롤 종료 후 튕기는 속도. 작을 수록 천천히 튕긴다. 항상 1 < 이여야 한다.
	// SPEED_FACTOR: 관성크기. 클수록 살짝 튕겨도 멀리 간다.

	This.mTime = 0;
	This.mTimeUp = 0;
	This.mTimeStart = 0;

	This.mIsDown = false;
	This.mIsMoveOn = false;
	This.mIsScrollingT = false;
	This.mIsBounceModeT = false;
	This.mIsUseBounce = true;

	This.mViewLen = 0;
	This.mContentLen = 0;
	This.mDnT = 0;
	This.mMvT = 0;
	This.mUpT = 0;
	This.mStartT = 0;
	This.mRadT = 0;
	This.mRadDa = 0;
	This.mCurDt = 0;
	This.mPrevScrollT = 0;
	This.mScrollT = 0;
	This.mBounceLimitT = 0;
}

Scroll.prototype.setContentLen = function(len) {
	var This = this;
	This.mContentLen = len;
}

Scroll.prototype.getContentLen = function() {
	var This = this;
	return This.mContentLen;
}

Scroll.prototype.setViewLen = function(len) {
	var This = this;
	This.mViewLen = len;
}

Scroll.prototype.getViewLen = function() {
	var This = this;
	return This.mViewLen;
}

Scroll.prototype.refresh = function() {
	var This = this;
	This.setPos(This.mScrollT);
}

Scroll.prototype.getPos = function() {
	return this.mScrollT;
}

Scroll.prototype.setPos = function(t) {
	var This = this;

	This.mScrollT = t;
	This.limitScrollT();

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);

	if (This.opt.onScrollEnd)
		This.opt.onScrollEnd(true);

	/*
	This.clearMessages(0);
	This.mMsgHandler.start();
	This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 0);
	This.mMsgHandler.processMessage();
	*/

	//This.opt.onScroll(This.mScrollT);
}

Scroll.prototype.getScrollT = function() {
	return this.mScrollT;
}

Scroll.prototype.clearMessages = function(action) {
	var This = this;

	This.mMsgHandler.clearMessages(action);

	if (action == 0)
		This.mIsScrollingT = false;
}

Scroll.prototype.calcDistance = function(t) {
	var This = this;

	var dt = t - This.mDnT;
	var nt = This.mPrevScrollT + dt;

	return nt;
}

Scroll.prototype.limitScrollT = function() {
	var This = this;
	This.mScrollT = Math.min(This.getContentLen() - This.getViewLen() + (This.mIsUseBounce ? This.mBounceLimitT : 0), Math.max(This.mIsUseBounce ? -This.mBounceLimitT : 0, This.mScrollT));
	//ar.log(This.mScrollT);
}

Scroll.prototype.onAction = function(m) {
	var This = this;
	var fpsSpeed = ar.FPS_STANDARD / ar.FPS;
	var BOUNCE_LIMIT = 100;

	switch (m.mAction) {
		case This.SSMSG_SCROLL_T: {
			if (This.mIsBounceModeT) {
				if (This.mScrollT < 0) {
					This.mScrollT = Math.max(This.mBounceLimitT, This.mScrollT + This.mCurDt * fpsSpeed);
				}
				else {
					This.mScrollT = Math.min(This.mBounceLimitT, This.mScrollT + This.mCurDt * fpsSpeed);
				}
			}
			else {
				if (This.mScrollT < 0) {
					This.mIsBounceModeT = This.mIsUseBounce;
					This.mBounceLimitT = Math.max(-BOUNCE_LIMIT, This.mCurDt * 7);
				}
				else if (This.mScrollT > This.getContentLen() - This.getViewLen()) {
					This.mIsBounceModeT = This.mIsUseBounce;
					This.mBounceLimitT = This.getContentLen() - This.getViewLen() + Math.min(BOUNCE_LIMIT, This.mCurDt * 7);
				}
				else {
					This.mCurDt *= Math.cos(This.mRadT);
					This.mScrollT += This.mCurDt * fpsSpeed;
					This.mRadT = Math.min(This.M_PI_2, This.mRadT + This.mRadDa); // mRadDa가 작을수록 This.mCurDt 값이 천천히 감소하므로, 더 부드럽게 멈춰진다
				}
			}
			
			This.limitScrollT();

			if (This.opt.onScroll)
				This.opt.onScroll(This.mScrollT);
			
			if (This.mIsBounceModeT && ((This.mScrollT < 0 && This.mScrollT <= This.mBounceLimitT) || (This.mScrollT > This.getContentLen() - This.getViewLen() && This.mBounceLimitT <= This.mScrollT))) {
				This.clearMessages(This.SSMSG_SCROLL_T);
				This.clearMessages(This.SSMSG_SCROLL_T_FIX);
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T_FIX, 1000 / ar.FPS);
			}
			else if (This.mIsUseBounce == false && This.mScrollT < 0) {
				This.mScrollT = 0;
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
			else if (This.mIsUseBounce == false && This.mScrollT > This.getContentLen() - This.getViewLen()) {
				This.mScrollT = This.getContentLen() - This.getViewLen();
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
			else if (This.mRadT < This.M_PI_2) {
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 1000 / ar.FPS);
			}
			else {
				This.mMsgHandler.stop();

				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
		}
			break;

		case This.SSMSG_SCROLL_T_FIX: {
			if (This.mScrollT <= 0) {
				This.mScrollT /= Math.pow(This.BOUNCE_SPEED, fpsSpeed);

				if (-1 < This.mScrollT)
					This.mScrollT = 0;
			}
			else if (This.mScrollT > This.getContentLen() - This.getViewLen()) {
				var dt = (This.mScrollT - (This.getContentLen() - This.getViewLen())) / Math.pow(This.BOUNCE_SPEED, fpsSpeed);

				if (dt < 1)
					dt = 0;

				This.mScrollT = This.getContentLen() - This.getViewLen() + dt;
			}

			This.limitScrollT();

			if (This.opt.onScroll)
				This.opt.onScroll(This.mScrollT);

			if (This.mScrollT < 0 || This.mScrollT > This.getContentLen() - This.getViewLen()) {
				This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T_FIX, 1000 / ar.FPS);
			}
			else {
				This.mMsgHandler.stop();
				if (This.opt.onScrollEnd)
					This.opt.onScrollEnd(true);
			}
		}
			break;
	}
}

Scroll.prototype.onDn = function(t) {
	var This = this;

	if (This.mIsDown)
		return;

	This.clearMessages(0);
	This.mMsgHandler.start();

	var time = ar.tick();

	This.mTime = time;
	This.mTimeStart = time;
	This.mIsScrollingT = true;
	This.mIsDown = true;
	This.mIsMoveOn = false;
	This.mIsBounceModeT = false;
	This.mBounceLimitT = 0;
	This.mDnT = t;
	This.mStartT = t;
	This.mPrevScrollT = This.mScrollT;
	This.mMvQueue = [];
	This.mRadT = 0;
	This.mRadDa = This.M_PI_2;
	This.mCurDt = 0;

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);

	setTimeout(function() {
		This.mMsgHandler.processMessage();
	}, 0);
}

Scroll.prototype.onMv = function(t) {
	var This = this;

	if (This.mIsDown == false)
		return;

	if (This.opt.moveThreshold) {
		if (This.mIsMoveOn == false && Math.abs(t - This.mDnT) > This.opt.moveThreshold) {
			This.mIsMoveOn = true;
			This.mDnT = t;
		}

		if (This.mIsMoveOn == false)
			return;
	}

	var time = ar.tick();

	if (time - This.mTimeStart > 300) {
		This.mStartT = t;
		This.mTimeStart = time;
	}

	var q = {};
	q.t = t;
	q.time = time;

	This.mMvT = t;
	This.mMvQueue.push(q);

	if (This.mMvQueue.length > 50)
		This.mMvQueue.splice(0, 1);

	var nt = This.calcDistance(t);

	if (nt < 0)
		nt *= This.ELASTICITY;
	else if (nt > This.getContentLen() - This.getViewLen())
		nt = This.getContentLen() - This.getViewLen() + (nt - (This.getContentLen() - This.getViewLen())) * This.ELASTICITY;

	This.mScrollT = nt;
	This.limitScrollT();

	if (This.opt.onScroll)
		This.opt.onScroll(This.mScrollT);
}

Scroll.prototype.onUp = function(t) {
	var This = this;

	This.mTimeUp = ar.tick();
	This.mIsDown = false;
	This.mUpT = t;

	// touch down 후 한참 있다 빠르게 swiping 하는 액션도 고려한다
	// This.mStartT, mTimeStart는 스와이핑 액션이 시작되는 기준점이다. down pos와 관계 없이 move event handler 내에서 시간 체크를 하면서 계속 변한다

	var prevTime = This.mTimeUp;
	var moveTime = 0;
	var isQuickUp = false;
	var TRIGGER_TIME_MOVE = ar.isIos() ? 150 : 300;
	var TRIGGER_TIME_UP = ar.isIos() ? 300 : 700;

	//$('#d').html(JSON.stringify(This.mMvQueue));	

	if (This.mMvQueue.length < 3 && Math.abs(This.mUpT - This.mDnT) > 70)
		isQuickUp = true;
	else
		while (This.mMvQueue.length > 0 && moveTime < TRIGGER_TIME_MOVE) {
			var q = This.mMvQueue.pop();
			moveTime += (prevTime - q.time);
			prevTime = q.time;

			if (moveTime < TRIGGER_TIME_MOVE && Math.abs(t - q.t) > 20) {
				isQuickUp = true;
				break;
			}
		}

	//ar.log(This.mMvQueue.length + ',' + This.mUpT + ',' + This.mDnT + ',' + isQuickUp);

	var time = This.mTimeUp - This.mTimeStart;
	var isFastTouchUp = time < TRIGGER_TIME_UP && isQuickUp;

	var dt = t - This.mStartT;
	var nt = This.calcDistance(t);

	if (This.mIsUseBounce && (nt < 0 || nt > This.getContentLen() - This.getViewLen()))
		dt *= This.ELASTICITY;

	if (isFastTouchUp) {
		This.mRadT = 0;
		This.mRadDa = This.M_PI_2 / Math.min(600, 30000 / time);
		This.mCurDt = dt * This.SPEED_FACTOR;
	}
	else {
		This.mRadT = 0;
		This.mRadDa = This.M_PI_2;
		This.mCurDt = 0;
	}

	This.mMsgHandler.scheduleMessage(This.SSMSG_SCROLL_T, 0);
}

Scroll.prototype.onCn = function() {
	var This = this;
	This.onUp(This.mMvT);
}

Scroll.prototype.stop = function() {
	var This = this;

	This.mMsgHandler.stop();
	This.clearMessages(0);
}
