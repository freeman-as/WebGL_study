(() => {
    let canvas;       // canvas element
    let canvasWidth;  // canvas の幅
    let canvasHeight; // canvas の高さ
    let gl;           // canvas から取得した WebGL のコンテキスト
    let scenePrg;     // シーン描画用プログラム
    let run;          // WebGL の実行フラグ
    let startTime;    // 描画を開始した際のタイムスタンプ
    let nowTime;      // 描画を開始してからの経過時間

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

        // Esc キーで実行を止められるようにイベントを設定
        window.addEventListener('keydown', (eve) => {
            // 入力されたキーが Esc キーなら実行フラグを降ろす
            run = eve.keyCode !== 27;
            console.log(run)
        }, false);

        // シェーダーソースを取得
        let vertexSource = document.getElementById('vs').textContent;
        let fragmentSource = document.getElementById('fs').textContent;
        if(vertexSource == null || fragmentSource == null){return;}

        // コンパイルを行いシェーダオブジェクト生成
        let vs = create_shader(vertexSource, gl.VERTEX_SHADER);
        let fs = create_shader(fragmentSource, gl.FRAGMENT_SHADER);

        // シェーダオブジェクトをプログラムオブジェクトにアタッチ
        let prg = create_program(vs, fs);
        if(prg == null){return;}

        // プログラムオブジェクトを管理しやすいようにクラスでラップする
        scenePrg = new ProgramParameter(prg);

        // 初期化処理を呼び出す
        init();

    }, false);

    function init(){
        // プログラムオブジェクトから attribute location を取得しストライドを設定する
        scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'position');
        scenePrg.attLocation[1] = gl.getAttribLocation(scenePrg.program, 'color');

        scenePrg.attStride[0]   = 3;
        scenePrg.attStride[1]   = 4;

        // uniformLocationの取得
        scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mvpMatrix');
        scenePrg.uniType[0] = 'uniformMatrix4fv'

        // 頂点座標を定義する
        let position = [
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0
        ];

        let color = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ]

        // 頂点座標の配列から VBO（Vertex Buffer Object）を生成する
        let VBO = [
            create_vbo(position),
            create_vbo(color)
        ];

        // VBO を有効化する
        set_attribute(VBO, scenePrg.attLocation, scenePrg.attStride)

        // canvas初期化用のカラーを設定
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // canvas初期化用の深度を設定
        gl.clearDepth(1.0);

        // minMatrix.js を用いた行列関連処理
        // matIVオブジェクトを生成
        var m = new matIV();

        // 各種行列の生成と初期化
        var mMatrix = m.identity(m.create());
        var vMatrix = m.identity(m.create());
        var pMatrix = m.identity(m.create());
        var vpMatrix = m.identity(m.create());
        var mvpMatrix = m.identity(m.create());

        // ビュー座標変換行列
        // [カメラ座標], [カメラの注視点], [カメラの上方向]
        m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);

        // プロジェクション座標変換行列
        // [視野角], [アスペクト比], [near], [far]
        m.perspective(90, canvasWidth / canvasHeight, 0.1, 100, pMatrix);

        // ビュー×プロジェクション座標変換行列
        m.multiply(pMatrix, vMatrix, vpMatrix);

        // 未初期化の変数を初期化する
        startTime = Date.now();
        nowTime = 0;
        run = true;

        let count = 0;

        // レンダリング開始
        render();
        function render(){
            // 描画開始からの経過時間（秒単位）
            nowTime = (Date.now() - startTime) / 1000;

            // ウィンドウサイズの変更に対応するため canvas のサイズを更新
            canvasWidth   = window.innerWidth;
            canvasHeight  = window.innerHeight;
            canvas.width  = canvasWidth;
            canvas.height = canvasHeight;
            // canvas のサイズとビューポートの大きさを揃える
            gl.viewport(0, 0, canvasWidth, canvasHeight);

            // どのプログラムオブジェクトを利用するか設定
            gl.useProgram(scenePrg.program);

            // 事前に設定済みの色でクリアする
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // カウンタをインクリメント
            count++;
            if(count > 360)count = 0;

            // カウンタを元にラジアンを算出
            let rad = (count % 360) * Math.PI / 180;

            // モデル1は円の軌跡を描き移動
            let x = Math.cos(rad);
            let y = Math.sin(rad);
            m.identity(mMatrix);
            m.translate(mMatrix, [x, y + 1.0, 0.0], mMatrix);

            // モデル1のMVP行列
            m.multiply(vpMatrix, mMatrix, mvpMatrix);

            // uniformLocationへ座標変換行列を登録
            gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // モデル2はY軸中心に回転
            m.identity(mMatrix);
            m.translate(mMatrix, [1.0, -1.0, 0.0], mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);

            // モデル2のMVP行列
            m.multiply(vpMatrix, mMatrix, mvpMatrix);

            // uniformLocationへ座標変換行列を登録
            gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // モデル3は拡大縮小
            let s = Math.sin(rad) + 1.0;
            m.identity(mMatrix);
            m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);
            m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
            m.scale(mMatrix, [s, s, 0.0], mMatrix);

            // モデル3のMVP行列
            m.multiply(vpMatrix, mMatrix, mvpMatrix);

            // uniformLocationへ座標変換行列を登録
            gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            // コンテキストの再描画
            gl.flush();

            if(run){requestAnimationFrame(render);}
        }
    }

    // utility ================================================================

    class ProgramParameter {
        /**
         * @constructor
         * @param {WebGLProgram} program - プログラムオブジェクト
         */
        constructor(program){
            /**
             * @type {WebGLProgram} プログラムオブジェクト
             */
            this.program = program;
            /**
             * @type {Array} attribute location を格納する配列
             */
            this.attLocation = [];
            /**
             * @type {Array} attribute stride を格納する配列
             */
            this.attStride = [];
            /**
             * @type {Array} uniform location を格納する配列
             */
            this.uniLocation = [];
            /**
             * @type {Array} uniform 変数のタイプを格納する配列
             */
            this.uniType = [];
        }
    }

    /**
     * シェーダオブジェクトを生成して返す。
     * コンパイルに失敗した場合は理由をアラートし null を返す。
     * @param {string} source - シェーダのソースコード文字列
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {WebGLShader} シェーダオブジェクト
     */
    function create_shader(source, type){
        if(source == null){return;}
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        } else {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。
     * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
     * @param {WebGLShader} vs - 頂点シェーダオブジェクト
     * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
     * @return {WebGLProgram} プログラムオブジェクト
     */
    function create_program(vs, fs){
        if(vs == null || fs == null){return;}
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        } else {
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * VBO を生成して返す。
     * @param {Array} data - 頂点属性データを格納した配列
     * @return {WebGLBuffer} VBO
     */
    function create_vbo(data){
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    /**
     * VBO / IBO をバインドし有効化する。
     * @param {Array} vbo - VBO を格納した配列
     * @param {Array} attL - attribute location を格納した配列
     * @param {Array} attS - attribute stride を格納した配列
     * @param {WebGLBuffer} ibo - IBO
     */
    function set_attribute(vbo, attL, attS, ibo){
        for(let i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }
})();
