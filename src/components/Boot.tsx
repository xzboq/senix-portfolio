/** Заставка «гиперпрыжок»: звёзды растягиваются в лучи от центра, проступает логотип, затем всё растворяется.
 *  Показывается только при html[data-boot] (ставит bootScript до отрисовки), один раз за сессию.
 *  Рисует встроенный скрипт сразу при разборе HTML — до загрузки React, поэтому без задержки. */
const WARP = `(function(){var d=document.documentElement;if(!d.hasAttribute("data-boot"))return;var c=document.getElementById("boot-warp");if(!c||!c.getContext)return;var x=c.getContext("2d"),w=c.width=innerWidth,h=c.height=innerHeight,cx=w/2,cy=h/2,M=Math.max(w,h),S=[],t0=performance.now(),light=d.getAttribute("data-theme")==="light",bg=getComputedStyle(d).getPropertyValue("--bg").trim()||"#07070c",col=light?"108,92,231":"205,196,255";for(var i=0;i<340;i++){var r=Math.random()*M*0.06;S.push({a:Math.random()*6.2832,d:r,p:r,s:0.5+Math.random()*1.7})}function f(n){var k=(n-t0)/1000;if(k>1.3)return;x.globalAlpha=0.32;x.fillStyle=bg;x.fillRect(0,0,w,h);x.globalAlpha=1;var v=1.5+Math.pow(k*2.6,3)*5;for(var i=0;i<S.length;i++){var s=S[i],ca=Math.cos(s.a),sa=Math.sin(s.a);s.p=s.d;s.d+=v*s.s*(0.35+s.d/M*2);x.strokeStyle="rgba("+col+","+Math.min(1,s.d/(M*0.25)).toFixed(3)+")";x.lineWidth=Math.min(2.4,0.5+s.d/(M*0.35));x.beginPath();x.moveTo(cx+ca*s.p,cy+sa*s.p);x.lineTo(cx+ca*s.d,cy+sa*s.d);x.stroke();if(s.d>M){s.d=Math.random()*M*0.04;s.p=s.d}}requestAnimationFrame(f)}requestAnimationFrame(f)})()`;

export function Boot() {
  return (
    <div className="boot" aria-hidden="true">
      <canvas id="boot-warp" />
      <script dangerouslySetInnerHTML={{ __html: WARP }} />
      <p className="boot-mark">
        UTKIR<i>.</i>
      </p>
    </div>
  );
}
