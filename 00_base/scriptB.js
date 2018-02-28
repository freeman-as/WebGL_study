window.onload = function(){
	// HTML荳翫�Canvas縺ｸ縺ｮ蜿ら�繧貞叙蠕励☆繧�
	var c = document.getElementById('canvas');

	// Canvas繧ｵ繧､繧ｺ繧貞､画峩
	c.width = 512;
	c.height = 512;

	// Canvas繧ｨ繝ｬ繝｡繝ｳ繝医°繧姥ebGL繧ｳ繝ｳ繝�く繧ｹ繝医ｒ蜿門ｾ励☆繧�
	var gl = c.getContext('webgl');

	// WebGL繧ｳ繝ｳ繝�く繧ｹ繝医′蜿門ｾ励〒縺阪◆縺九←縺�°隱ｿ縺ｹ繧�
	if(!gl){
		alert('webgl not supported!');
		return;
	}

	// Canvas繧ｨ繝ｬ繝｡繝ｳ繝医ｒ繧ｯ繝ｪ繧｢縺吶ｋ濶ｲ繧呈欠螳壹☆繧�
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Canvas繧ｨ繝ｬ繝｡繝ｳ繝医ｒ繧ｯ繝ｪ繧｢縺吶ｋ
	gl.clear(gl.COLOR_BUFFER_BIT);

	// 荳芽ｧ貞ｽ｢繧貞ｽ｢謌舌☆繧矩�らせ縺ｮ繝��繧ｿ繧貞女縺大叙繧�
	var triangleData = genTriangle();

	// 鬆らせ繝��繧ｿ縺九ｉ繝舌ャ繝輔ぃ繧堤函謌�
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleData.p), gl.STATIC_DRAW);

	// 繧ｷ繧ｧ繝ｼ繝縺ｨ繝励Ο繧ｰ繝ｩ繝�繧ｪ繝悶ず繧ｧ繧ｯ繝�
	var vertexSource = document.getElementById('vs').textContent;
	var fragmentSource = document.getElementById('fs').textContent;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var programs = gl.createProgram();
	gl.shaderSource(vertexShader, vertexSource);
	gl.compileShader(vertexShader);
	gl.attachShader(programs, vertexShader);
	gl.shaderSource(fragmentShader, fragmentSource);
	gl.compileShader(fragmentShader);
	gl.attachShader(programs, fragmentShader);
	gl.linkProgram(programs);
	gl.useProgram(programs);

	// 繝励Ο繧ｰ繝ｩ繝�繧ｪ繝悶ず繧ｧ繧ｯ繝医↓荳芽ｧ貞ｽ｢縺ｮ鬆らせ繝��繧ｿ繧堤匳骭ｲ
	var attLocation = gl.getAttribLocation(programs, 'position');
	gl.enableVertexAttribArray(attLocation);
	gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

	// 謠冗判
	gl.drawArrays(gl.TRIANGLES, 0, triangleData.p.length / 3);
	gl.flush();
};

function genTriangle(){
	var obj = {};
	obj.p = [
		 0.0,  0.5, 0.0,
		 0.5, -0.5, 0.0,
		-0.5, -0.5, 0.0
	];
	return obj;
}
