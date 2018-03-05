(() => {
    let canvas;       // canvas element
    let canvasWidth;  // canvas の幅
    let canvasHeight; // canvas の高さ
    let gl;           // canvas から取得した WebGL のコンテキスト
    let ext;          // WebGL の拡張機能を格納する
    let run;          // WebGL の実行フラグ
    let startTime;    // 描画を開始した際のタイムスタンプ
    let nowTime;      // 描画を開始してからの経過時間
    let scenePrg;     // シーン描画用プログラム

    // ウィンドウのロードが完了したら WebGL 関連の処理をスタートする
    window.addEventListener('load', () => {
        // canvas element を取得しサイズをウィンドウサイズに設定
        canvas        = document.getElementById('canvas');
        canvasWidth   = window.innerWidth;
        canvasHeight  = window.innerHeight;
        canvas.width  = canvasWidth;
        canvas.height = canvasHeight;

        // webgl コンテキストを初期化
        gl = canvas.getContext('webgl');
        if(gl == null){
            console.log('webgl not supported');
            return;
        }

        window.addEventListener('keydown', (eve) => {
            run = eve.keyCode !== 27;
            console.log(run)
        }, false);

        // 初期化処理を呼び出す
        init();

    }, false);

    function init(){
        // canvasを黒でクリア
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
})();
