window.onload = function(){

    // canvas参照
    var c = document.getElementById('canvas');

    // canvasサイズ変更
    c.width = 512;
    c.height = 512;

    // webglコンテキスト取得
    var gl = c.getContext('webgl');
    // Webglコンテキストが取得できたかどうかチェック
    if(!gl){
        alert('webgl not supported');
        return;
    }

    // canvasエレメントをクリアする色を指定
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // canvasエレメントをクリア
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 三角形を生成する頂点データを受け取る
    var triangleData = genTriangle();

    // matIVクラスをインスタンス化する
    var mat = new matIV();

    // 行列の生成
    var Matrix = mat.create();

    // 行列を初期化
    mat.identity();

    // 頂点データからバッファを生成
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData.p), gl.STATIC_DRAW);

    // シェーダーとプログラムオブジェクト
    var vertexSource = document.getElementById('vs').textContent;
    var fragmentSource = document.getElementById('fs').textContent;

    var programs = shaderProgram(vertexSource, fragmentSource);

    // プログラムオブジェクトに三角形の頂点データを登録
    var attLocation = gl.getAttribLocation(programs, 'position');
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

    // 描画
    gl.drawArrays(gl.TRIANGLES, 0, triangleData.p.length / 3);
    gl.flush();


    function shaderProgram(vertexSource, fragmentSource){
        // シェーダーオブジェクトの生成
        var shader;
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        // シェーダーにソースを割り当ててコンパイル
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        shader = vertexShader;
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            // コンパイル成功
        } else {
            // コンパイル失敗
            alert(gl.getShaderInfoLog(shader))
        }

        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        shader = fragmentShader;
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            // コンパイル成功
        } else {
            // コンパイル失敗
            alert(gl.getShaderInfoLog(shader))
        }

        // プログラムオブジェクトの生成から選択まで
        var programs = gl.createProgram();
        gl.attachShader(programs, vertexShader);
        gl.attachShader(programs, fragmentShader);
        gl.linkProgram(programs);
        if(gl.getProgramParameter(programs, gl.COMPILE_STATUS)){
            // コンパイル成功
        } else {
            // コンパイル失敗
            alert(gl.getProgramInfoLog(programs))
        }

        gl.useProgram(programs);

        // 生成したプログラムオブジェクトを戻り値として返す
        return programs;
    }

    function genTriangle(){
    	var obj = {};
    	obj.p = [
    		 0.0,  0.5, 0.0,
    		 0.5, -0.5, 0.0,
    		-0.5, -0.5, 0.0,

            0.0,  -0.5, 0.0,
            0.5, 0.5, 0.0,
           -0.5, 0.5, 0.0
    	];
    	return obj;
    }
};
