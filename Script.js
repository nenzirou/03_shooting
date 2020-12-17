enchant();
enchant.Sound.enabledInMobileSafari = true;

window.onload = function () {
	var core = new Core(400, 500);
	core.fps = 30;
	var url = "http://nenzirou.html.xdomain.jp/UnchiShooting/index.html";
	url = encodeURI(url);
	var game_bottom = 550;
	var game_top = -50;
	var game_right = 500;
	var game_left = -100
	var enemyArray = [];
	var bulletArray = [];
	var point = 0;
	var state = 0;
	var genePoint = 100;
	var cnt = 0;
	var magnification = 1;
	var ojiX = 0;
	var ojiY = 0;
	var clear = false;
	//プリロード
	var ASSETS = {
		"se_pon": 'sound/pon.wav',
		"se_pan": 'sound/pan.wav',
		"se_damage": 'sound/damage.wav',
		"se_kyouka": 'sound/kyouka.wav',
		"se_bu": 'sound/bu.wav',
		"se_start": 'sound/start.wav',
		"se_kansei": 'sound/kansei.wav',
		"img_oji": 'img/oji.png',
		"img_unchi": 'img/unchi.png',
		"img_star": 'img/star.png',
		"img_button": 'img/button.png',
		"img_enemy1": 'img/enemy1.png',
		"img_enemy2": 'img/enemy2.png',
		"img_enemy3": 'img/enemy3.png',
		"img_enemy4": 'img/enemy4.png',
		"img_enemy5": 'img/enemy5.png',
		"img_ed": 'img/ed.png',
		"bgm": 'sound/bgm.wav',
	};
	core.preload(ASSETS);
	////////////////////////////////////////////////クラス・関数////////////////////////////////////////////////////
	//オブジェクトが従うクラス
	var Obj = Class.create(Sprite, {
		initialize: function (width, height, x, y, scene, img) {
			Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			if (img != null) this.image = core.assets[img];
			this.hp = 1;
			scene.addChild(this);
		},
		move: function (dx, dy) {
			this.x += dx;
			this.y += dy;
		},
	});

	//おじさん
	var Oji = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 20, 40, x, y, scene, "img_oji");
			this.rotation = 180;
			this.frame = [0, 2, 1, 2];
			this.HP = 1;
			this.interval = 15;
			this.power = 1;
			this.hpCnt = 0;
			this.sX = 200;
			this.sY = 300;
			this.muteki = false;
			this.addEventListener("enterframe", function () {
				if (this.hpCnt == 0) {
					// 敵との当たり判定
					for (var i = 0; i < enemyArray.length; i++) {
						if (enemyArray[i] != null) {
							if (this.within(enemyArray[i], 15)) {
								this.hpCnt++;
								this.hp--;
								core.assets['se_damage'].clone().play();
							}
						}
					}
					// 弾との当たり判定
					for (var i = 0; i < bulletArray.length; i++) {
						if (bulletArray[i] != null) {
							if (this.within(bulletArray[i], 8)) {
								this.hpCnt++;
								this.hp--;
								core.assets['se_damage'].clone().play();
							}
						}
					}
				} else if (this.hpCnt > 0) {
					this.hpCnt++;
					this.muteki = true;
					if (this.hpCnt % 5 == 1) this.opacity = 0;
					else if (this.hpCnt % 5 == 4) this.opacity = 1;
					if (this.hpCnt >= 40) {
						this.Release();
					}
				}
			});
		},
		Release: function () {
			this.muteki = false;
			this.hpCnt = 0;
			this.opacity = 1;
		}
	});

	//うんち
	var Unchi = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 50, 42, x, y, scene, "img_unchi");
			this.scale(0.25, 0.25);
			this.rotation = 180;
			this.speed = 25;
			this.addEventListener("enterframe", function () {
				if (n == 0) this.move(0, -this.speed);//まっすぐうんち
				else if (n == 1) this.move(1.5, - this.speed);
				else if (n == 2) this.move(-1.5, -this.speed);
				else if (n == 3) this.move(3, -this.speed);
				else if (n == 4) this.move(-3, -this.speed);
				else if (n == 5) this.move(4.5, -this.speed);
				else if (n == 6) this.move(-4.5, -this.speed);
				else if (n == 7) this.move(6, -this.speed);
				else if (n == 8) this.move(-6, -this.speed);
				else if (n == 9) this.move(7.5, -this.speed);
				else if (n == 10) this.move(-7.5, -this.speed);
				for (var i = 0; i < enemyArray.length; i++) {
					if (enemyArray[i] != null) {
						if (this.intersect(enemyArray[i])) {
							this.hp--;
							enemyArray[i].hp--;
							if (enemyArray[i].hp == 0) point += enemyArray[i].point * magnification;
						}
					}
				}
				if (this.y <= game_top || this.hp <= 0) {
					this.parentNode.removeChild(this);
				}
			});
		}
	});

	//////////////////////////////////////////////////////Enemy/////////////////////////////////////////////////
	//クロスケ
	var Enemy1 = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 32, 32, x, y, scene, "img_enemy1");
			this.speed = 3;
			if (n == 0) {
				this.frame = [0, 0, 1, 1, 2, 2, 1, 1];
				this.point = 20;
			} else if (n == 1) {
				this.frame = [3, 3, 4, 4, 5, 5, 4, 4];
				this.point = 40;
			} else if (n == 2) {
				this.frame = [6, 6, 7, 7, 8, 8, 7, 7];
				this.point = 120;
				this.hp = 2;
			}
			var no = enemyArray.length;
			enemyArray.push(this);
			this.addEventListener("enterframe", function () {
				if (n == 0) this.move(0, this.speed);//まっすぐ
				else if (n == 1) this.move(Math.sin(this.age / 10) * 5, this.speed / 2);
				else if (n == 2) {
					this.move(Math.sin(this.age / 10) * 5, Math.cos(this.age / 10) * 5 + this.speed / 2);
					MakeBullet(this.x, this.y, 1, 100, this, scene);
				}
				if (this.y >= game_bottom || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					if (n == 0) MakeBullet(this.x, this.y, 0, 0, this, scene);
					else if (n == 1) MakeBullet(this.x, this.y, 1, 0, this, scene);
					this.parentNode.removeChild(this);
					enemyArray[no] = null;
					if (this.hp <= 0) core.assets['se_pan'].clone().play();
				}
			});
		}
	});

	// 飛行艇
	var Enemy2 = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 32, 32, x, y, scene, "img_enemy2");
			this.speed = 3;
			this.point = state * 1000 + 1000;
			this.hp = 10 + state * 10;
			var no = enemyArray.length;
			enemyArray.push(this);
			this.addEventListener("enterframe", function () {
				if (this.age <= 60) this.move(0, 1);
				this.move(Math.sin(this.age / 30) * this.speed * 2, Math.sin(2 * this.age / 30) * this.speed);
				MakeBullet(this.x, this.y, 3, 100, this, scene);
				if (this.y >= game_bottom || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					this.parentNode.removeChild(this);
					enemyArray[no] = null;
					state++;
					cnt = 0;
					if (this.hp <= 0) core.assets['se_pan'].clone().play();
				}
			});
		}
	});

	// 飛行艇2
	var Enemy3 = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 32, 32, x, y, scene, "img_enemy3");
			this.speed = 3;
			this.point = 800;
			this.hp = 15;
			var no = enemyArray.length;
			enemyArray.push(this);
			this.addEventListener("enterframe", function () {
				if (this.age <= 30) this.move(0, this.speed);
				MakeBullet(this.x, this.y, 2, 20, this, scene)
				if (this.y >= game_bottom || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					this.parentNode.removeChild(this);
					enemyArray[no] = null;
					if (this.hp <= 0) core.assets['se_pan'].clone().play();
				}
			});
		}
	});

	// 敵うんち
	var Enemy4 = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 64, 48, x, y, scene, "img_enemy4");
			this.speed = 2;
			this.point = 5000;
			this.hp = 15;
			this.scale(0.5, 0.5);
			if (n == 1) this.frame = 4;
			else if (n == 2) this.frame = 7;
			var no = enemyArray.length;
			enemyArray.push(this);
			this.addEventListener("enterframe", function () {
				if (!(n == 2) || !(cnt >= 30)) this.move(0, this.speed);
				this.rotation += 10;
				if (n == 0) MakeBullet(this.x + 16, this.y + 12, 4, 5, this, scene);
				else if (n == 1) MakeBullet(this.x + 16, this.y + 12, 5, 7, this, scene);
				else if (n == 2) MakeBullet(this.x + 16, this.y + 12, 6, 60, this, scene);
				if (this.y >= game_bottom || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					this.parentNode.removeChild(this);
					enemyArray[no] = null;
					if (this.hp <= 0) core.assets['se_pan'].clone().play();
				}
			});
		}
	});

	// もも
	var Enemy5 = Class.create(Obj, {
		initialize: function (x, y, n, scene) {
			Obj.call(this, 64, 48, x, y, scene, "img_enemy5");
			this.speed = 3;
			this.point = 10000 + state * 5000;
			this.hp = 100 + state * 30;
			this.scale(0.75, 0.75);
			if (n == 1) {
				this.frame = 6;
				this.rotation = 180;
				this.hp = 1500;
			}
			var no = enemyArray.length;
			enemyArray.push(this);
			this.addEventListener("enterframe", function () {
				if (this.age <= 60) this.move(0, 1);
				this.move(Math.sin(this.age / 30) * this.speed * 2, Math.sin(10 * this.age / 30) * this.speed);
				MakeBullet(this.x + 16, this.y + 12, 5, 10, this, scene);
				MakeBullet(this.x + 16, this.y + 12, 2, 20, this, scene);
				if (n == 6) {
					MakeBullet(this.x + 16, this.y + 12, 3, 60, this, scene);
					MakeBullet(this.x + 16, this.y + 12, 1, 10, this, scene);
				}
				if (this.y >= game_bottom || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					this.parentNode.removeChild(this);
					enemyArray[no] = null;
					state++;
					cnt = 0;
					if (this.hp <= 0) core.assets['se_pan'].clone().play();
				}
			});
		}
	});

	//弾
	var Bullet = Class.create(Obj, {
		initialize: function (x, y, dx, dy, speed, color, scene) {
			Obj.call(this, 32, 32, x, y, scene, null);
			var surface = new Surface(32, 32);
			surface.context.arc(16, 16, 4, 0, Math.PI * 2, true);
			surface.context.fillStyle = color;
			surface.context.fill();
			this.image = surface;
			var no = bulletArray.length;
			bulletArray.push(this);
			this.addEventListener("enterframe", function () {
				this.move(dx * speed, dy * speed);
				if (this.y >= game_bottom - 32 || this.y <= game_top || this.x <= game_left || this.x >= game_right || this.hp <= 0) {
					this.parentNode.removeChild(this);
					bulletArray[no] = null;
				}
			});
		}
	});

	//星
	var Star = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 3, 3, x, y, scene, "img_star");
			this.frame = Math.floor(Rand(5) - 0.0001);
			this.speed = Rand(6) + 1;
			this.addEventListener("enterframe", function () {
				this.move(0, this.speed);
				if (this.y >= game_bottom) this.parentNode.removeChild(this);
			});
		}
	});

	//ボタン
	var Button = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 120, 60, x, y, scene, "img_button");
		}
	});

	//テキスト
	var Text = Class.create(Label, {
		initialize: function (x, y, font, color, scene) {
			Label.call(this);
			this.font = font + "px Meiryo";
			this.color = color;
			this.width = 400;
			this.moveTo(x, y);
			scene.addChild(this);
		}
	})
	//BGM
	var Bgm = enchant.Class.create({
		initialize: function () {
			this.data = null;
			this.isPlay = false;//プレイの状態フラグ
			this.isPuase = false;
		},
		//BGM用音楽ファイルのセット
		set: function (data) {
			this.data = data;
		},
		//再生(再生のみに使う)
		play: function () {
			this.data.play();
			this.isPlay = true;
			if (this.data.src != undefined) {//srcプロパティを持っている場合
				this.data.src.loop = true;
			}
		},
		//ループ再生(必ずループ内に記述すること) PCでのループ再生で使う
		loop: function () {
			if (this.isPlay == true && this.data.src == undefined) {//再生中でsrcプロパティを持っていない場合
				this.data.play();
				this.isPuase = false;//ポーズ画面から戻った場合は自動的に再生を再開させるため
			} else if (this.isPuase) {//srcあり場合でポーズ画面から戻ったとき用
				this.data.play();
				this.data.src.loop = true;//ポーズするとfalseになるっぽい(確認はしていない)
				this.isPuase = false;
			}
		},
		//再生停止(曲を入れ替える前は,必ずstop()させる)
		stop: function () {
			if (this.data != null) {
				if (this.isPuase) {
					this.isPlay = false;
					this.isPuase = false;
					this.data.currentTime = 0;
				} else if (this.isPlay) {
					this.data.stop();
					this.isPlay = false;
				}
			}
		},
		//一時停止（ポーズ画面などの一時的な画面の切り替え時に音を止めたいときのみ使う）
		pause: function () {
			if (this.data != null) {
				this.data.pause();
				this.isPuase = true;
			}
		}
	});

	// 星を生成する関数
	function MakeStar(scene) {
		if (scene.age % 5 == 0) new Star(Rand(400), 0, scene);
	}
	// うんちを射出する関数
	function MakeUnchi(x, y, n, scene) {
		new Unchi(x, y, n, scene);
	}
	//弾を生成する関数
	function MakeBullet(x, y, n, interval, obj, scene) {
		if (n == 0 && (obj.age % interval == 0 || interval == 0)) new Bullet(x, y, 0, 1, 7, "#aa1111", scene);
		else if (n == 1 && (obj.age % interval == 0 || interval == 0)) {
			var scalar = Math.sqrt(Math.pow(ojiX + 10 - x, 2) + Math.pow(ojiY + 20 - y, 2));
			var dx = (ojiX - x) / scalar;
			var dy = (ojiY - y) / scalar;
			new Bullet(x, y, dx, dy, 6, "#11aa11", scene);
		} else if (n == 2 && (obj.age % interval == 0 || interval == 0)) {
			for (var i = 0; i < 8; i++) {
				var dx = Math.sin(obj.age / interval + 45 * i * Math.PI / 180);
				var dy = Math.cos(obj.age / interval + 45 * i * Math.PI / 180);
				new Bullet(x, y, dx, dy, 6, "#aaaa11", scene);
			}
		} else if (n == 3) {
			for (var i = 0; i < 3; i++) {
				if (obj.age % interval == 20 * i) {
					MakeBullet(x, y, 1, 0, obj, scene);
				}
			}
		} else if (n == 4 && (obj.age % interval == 0 || interval == 0)) {
			var dx = Math.cos(obj.rotation * Math.PI / 180);
			var dy = Math.sin(obj.rotation * Math.PI / 180);
			new Bullet(x, y, dx, dy, 6, "#aa11aa", scene);
		} else if (n == 5 && (obj.age % interval == 0 || interval == 0)) {
			var dx = Math.cos(Math.random() * Math.PI);
			var dy = Math.sin(Math.random() * Math.PI);
			new Bullet(x, y, dx, 1, 6, "#11aaaa", scene);
		} else if (n == 6 && (obj.age % interval == 0 || interval == 0)) {
			for (var i = 0; i < 8; i++) {
				var sx = x + 32 * Math.sin(i * 45 * Math.PI / 180);
				var sy = y + 32 * Math.cos(i * 45 * Math.PI / 180);
				new Bullet(sx, sy, 0, 1, 2, "#11aaaa", scene);
			}
		}
	}
	//敵を生成する関数
	function MakeEnemy(mode, x, y, n, interval, scene) {
		if (mode == 1 && scene.age % interval == 0) new Enemy1(x, y, n, scene);
		else if (mode == 3 && scene.age % interval == 0) new Enemy3(x, y, n, scene);
		else if (mode == 4 && scene.age % interval == 0) new Enemy4(x, y, n, scene);
	}
	// ランダムにｎまでの整数を返す関数
	function Rand(n) {
		return Math.floor(Math.random() * n);
	}
	////////////////////////////////////////////////クラス・関数終わり////////////////////////////////////////////////////

	core.onload = function () {
		state = 99;
		var touch = [0, 0];
		var needPoint = [50, 100, 100, 1000];
		var pointText = [];
		var reinforcement = [];
		// エンディング画面
		S_END = new Scene();
		var ending = new Sprite(400, 500);
		ending.image = core.assets["img_ed"];
		S_END.addChild(ending);
		// エンディングボタン
		var S_Return = new Button(270, 430, S_END);
		S_Return.frame = 1;
		S_Return.ontouchend = function () {
			core.popScene();
			core.pushScene(S_Start);
		};

		//スタート画面
		S_Start = new Scene();
		core.pushScene(S_Start);
		S_Start.backgroundColor = "#FFFACD";

		//スタート画面のテキスト
		pointText.push(new Text(0, 0, 25, "#333333", S_Start));
		for (var i = 0; i < 4; i++) {
			pointText.push(new Text(10, 60 + 90 * i, 20, "#333333", S_Start));
		}

		// 強化ボタン
		for (var i = 0; i < 4; i++) {
			reinforcement.push(new Button(270, 50 + 90 * i, S_Start));
			reinforcement[i].frame = 4;
			reinforcement[i].scale(0.8, 0.8);
		}

		// 体力強化
		reinforcement[0].ontouchend = function () {
			if (genePoint >= needPoint[0]) {
				genePoint -= needPoint[0];
				oji.HP++;
				needPoint[0] = Math.floor(needPoint[0] * 1.5);
				core.assets['se_kyouka'].clone().play();
			} else core.assets['se_bu'].clone().play();
		}
		// うんち量強化
		reinforcement[1].ontouchend = function () {
			if (genePoint >= needPoint[1]) {
				if (oji.power < 11) {
					genePoint -= needPoint[1];
					oji.power++;
					needPoint[1] *= 2;
					core.assets['se_kyouka'].clone().play();
				}
				if (oji.power >= 11) {
					core.assets['se_bu'].clone().play();
					pointText[2].text = "うんち量　：MAX";
				}
			} else core.assets['se_bu'].clone().play();
		}
		// 連射速度強化
		reinforcement[2].ontouchend = function () {
			if (genePoint >= needPoint[2]) {
				if (oji.interval > 1) {
					genePoint -= needPoint[2];
					oji.interval--;
					needPoint[2] *= 2;
					core.assets['se_kyouka'].clone().play();
				}
				if (oji.interval <= 1) {
					core.assets['se_bu'].clone().play();
					pointText[3].text = "連射間隔　：MAX";
				}
			} else core.assets['se_bu'].clone().play();
		}
		// 得点倍率強化
		reinforcement[3].ontouchend = function () {
			if (genePoint >= needPoint[3]) {
				genePoint -= needPoint[3];
				magnification *= 2;
				needPoint[3] *= 8;
				core.assets['se_kyouka'].clone().play();
			} else core.assets['se_bu'].clone().play();
		}

		//startボタン
		var S_Go = new Button(50, 400, S_Start);
		S_Go.frame = 0;
		S_Go.ontouchend = function () {
			state = 0;
			core.popScene();
			core.pushScene(S_MAIN);
			core.assets['se_start'].clone().play();
		};

		//ツイートボタン
		var S_Tweet = new Button(230, 400, S_Start);
		S_Tweet.frame = 2;
		S_Tweet.ontouchend = function () {
			if (!clear) window.open("http://twitter.com/intent/tweet?text=【ほら、ケツが世界を救う】おじさんは" + genePoint + "ポイント分の敵をうんちに沈めた。おじさんの体力を" +
				oji.HP + ",うんち量を" + oji.power + ",連射間隔を" + oji.interval + "まで強化した！&url=" + url);
			if (clear) window.open("http://twitter.com/intent/tweet?text=【ほら、ケツが世界を救う】おじさんは" + genePoint + "ポイント分の敵をうんちに沈めた。おじさんの体力を" +
				oji.HP + ",うんち量を" + oji.power + ",連射間隔を" + oji.interval + "まで強化し、世界を救った！&url=" + url);
		};

		S_Start.addEventListener("enterframe", function () {
			if (state == 99) {
				pointText[0].text = "所持ポイント:" + genePoint;
				pointText[1].text = "体力　　　：" + oji.HP + "<br>ポイント　：" + needPoint[0];
				if (oji.power <= 10) pointText[2].text = "うんち量　：" + oji.power + "<br>ポイント　：" + needPoint[1];
				if (oji.interval != 1) pointText[3].text = "連射間隔　：" + (oji.interval / 30).toFixed(3) + "秒" + "<br>ポイント　：" + needPoint[2];
				pointText[4].text = "得点倍率　：" + magnification + "倍" + "<br>ポイント　：" + needPoint[3];
				if (clear) pointText[4].text = "得点倍率　：" + magnification + "倍" + "<br>ポイント　：" + needPoint[3] + "<br>                 ゲームクリア！！";
			}
		});

		//シーン設定
		var S_MAIN = new Scene();
		S_MAIN.backgroundColor = "#000020";
		//タッチ操作設定
		S_MAIN.addEventListener("touchstart", function (e) {
			touch[0] = e.localX;
			touch[1] = e.localY;
		});
		S_MAIN.addEventListener("touchmove", function (e) {
			oji.x -= touch[0] - e.localX;
			oji.y -= touch[1] - e.localY;
			touch[0] = e.localX;
			touch[1] = e.localY;
		});

		//背景のグループ
		var Back = new Group();
		S_MAIN.addChild(Back);

		var oji = new Oji(0, 0, S_MAIN);//おじさん生成

		//テキスト
		var C_Text = new Text(0, 0, 15, "#cccccc", S_MAIN);
		var stageBGM = new Bgm();
		stageBGM.set(core.assets["bgm"]);

		//////////////////////////////////////////////メインループ/////////////////////////////////////////////////////////////
		core.onenterframe = function () {
			stageBGM.loop();
			if (state == 0) {//初期化処理
				stageBGM.play();
				point = 0;
				cnt = 0;
				state = 1;
				oji.hp = oji.HP;
				oji.moveTo(oji.sX, oji.sY);
				oji.scale(40, 40);
				oji.tl.scaleBy(0.025, 0.025, 60, enchant.Easing.BOUNCE_EASEOUT);
				oji.Release();
				enemyArray = [];
				bulletArray = [];
				//new Enemy5(5, -32, 2, S_MAIN);
			} else if (state == 1) {//ステージ１
				if (cnt >= 60) MakeEnemy(1, Rand(360), 0, 0, 40, S_MAIN);
				if (cnt >= 7 * 30) MakeEnemy(1, Rand(300), 0, 1, 60, S_MAIN);
				if (cnt >= 14 * 30) MakeEnemy(1, Rand(300), 0, 2, 100, S_MAIN);
				if (cnt == 18 * 30) new Enemy2(5, -32, 0, S_MAIN);
			} else if (state == 2) {//ステージ２
				MakeEnemy(1, Rand(360), 0, 0, 30, S_MAIN);
				if (cnt >= 5 * 30) MakeEnemy(1, Rand(300), 0, 1, 40, S_MAIN);
				if (cnt >= 10 * 30) MakeEnemy(1, Rand(300), 0, 2, 50, S_MAIN);
				if (cnt == 20 * 30) new Enemy2(5, -32, 0, S_MAIN);
			} else if (state == 3) {//ステージ３
				MakeEnemy(1, Rand(360), 0, 0, 20, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 20, S_MAIN);
				if (cnt >= 7 * 30) MakeEnemy(1, Rand(300), 0, 2, 30, S_MAIN);
				if (cnt >= 14 * 30) MakeEnemy(3, Rand(300) + 50, 0, 2, 200, S_MAIN);
				if (cnt == 20 * 30) new Enemy2(5, -32, 0, S_MAIN);
			} else if (state == 4) {// ステージ４
				MakeEnemy(1, Rand(360), 0, 0, 10, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 20, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 2, 20, S_MAIN);
				if (cnt >= 14 * 30) MakeEnemy(3, Rand(300) + 50, 0, 2, 100, S_MAIN);
				if (cnt == 20 * 30) new Enemy2(5, -32, 0, S_MAIN);
			} else if (state == 5) {//ステージ５ 敵うんち出現
				MakeEnemy(1, Rand(360), 0, 0, 10, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 10, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 2, 10, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 0, 150, S_MAIN);
				if (cnt >= 7 * 30) MakeEnemy(4, Rand(360), 0, 1, 150, S_MAIN);
				if (cnt >= 14 * 30) MakeEnemy(4, Rand(300), 0, 2, 150, S_MAIN);
				if (cnt == 20 * 30) new Enemy5(5, -32, 0, S_MAIN);
			} else if (state == 6) {//ステージ６
				MakeEnemy(1, Rand(360), 0, 0, 6, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 6, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 2, 6, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 0, 100, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 1, 100, S_MAIN);
				if (cnt >= 14 * 30) MakeEnemy(4, Rand(300), 0, 2, 100, S_MAIN);
				if (cnt == 20 * 30) new Enemy5(5, -32, 0, S_MAIN);
			} else if (state == 7) {//ステージ７
				MakeEnemy(1, Rand(360), 0, 0, 5, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 5, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 2, 5, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 0, 80, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 1, 80, S_MAIN);
				MakeEnemy(4, Rand(300), 0, 2, 80, S_MAIN);
				if (cnt == 20 * 30) new Enemy5(5, -32, 0, S_MAIN);
			} else if (state == 8) {//ステージ８
				MakeEnemy(4, Rand(360), 0, 0, 50, S_MAIN);
				MakeEnemy(4, Rand(360), 0, 1, 50, S_MAIN);
				MakeEnemy(4, Rand(300), 0, 2, 50, S_MAIN);
				MakeEnemy(1, Rand(360), 0, 0, 5, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 1, 5, S_MAIN);
				MakeEnemy(1, Rand(300), 0, 2, 5, S_MAIN);
				if (cnt == 20 * 30) new Enemy5(5, -32, 1, S_MAIN);
			} else if (state == 9) {
				if (!clear) {
					clear = true;
					stageBGM.stop();
					state = 99;
					genePoint += point;
					// 敵全削除
					for (var i = 0; i < enemyArray.length; i++) {
						if (enemyArray[i] != null) {
							enemyArray[i].parentNode.removeChild(enemyArray[i]);
							enemyArray[i] = null;
						}
					}
					// 弾全削除
					for (var i = 0; i < bulletArray.length; i++) {
						if (bulletArray[i] != null) {
							bulletArray[i].parentNode.removeChild(bulletArray[i]);
							bulletArray[i] = null;
						}
					}
					core.popScene();
					core.pushScene(S_END);
					core.assets['se_kansei'].clone().play();
				} else if (clear) {
					MakeEnemy(1, Rand(360), 0, 0, 1, S_MAIN);
					MakeEnemy(1, Rand(300), 0, 1, 1, S_MAIN);
					MakeEnemy(1, Rand(300), 0, 2, 1, S_MAIN);
				}
			}

			if (S_MAIN.age % oji.interval == 0 && state >= 1 && state <= 10) {
				core.assets['se_pon'].clone().play();
				MakeUnchi(oji.x - 15, oji.y - 20, 0, S_MAIN);
				if (oji.power > 1) MakeUnchi(oji.x - 15, oji.y - 20, 1, S_MAIN);
				if (oji.power > 2) MakeUnchi(oji.x - 15, oji.y - 20, 2, S_MAIN);
				if (oji.power > 3) MakeUnchi(oji.x - 15, oji.y - 20, 3, S_MAIN);
				if (oji.power > 4) MakeUnchi(oji.x - 15, oji.y - 20, 4, S_MAIN);
				if (oji.power > 5) MakeUnchi(oji.x - 15, oji.y - 20, 5, S_MAIN);
				if (oji.power > 6) MakeUnchi(oji.x - 15, oji.y - 20, 6, S_MAIN);
				if (oji.power > 7) MakeUnchi(oji.x - 15, oji.y - 20, 7, S_MAIN);
				if (oji.power > 8) MakeUnchi(oji.x - 15, oji.y - 20, 8, S_MAIN);
				if (oji.power > 9) MakeUnchi(oji.x - 15, oji.y - 20, 9, S_MAIN);
				if (oji.power > 10) MakeUnchi(oji.x - 15, oji.y - 20, 10, S_MAIN);
			}
			// 全体処理
			if (state != 99) {
				cnt++;
				C_Text.text = "ステージ：" + state + "　体力：" + oji.hp + "　ポイント：" + point;
				MakeStar(Back);//星生成
				//おじさんの範囲制限
				if (oji.x <= 0) oji.x = 0;
				if (oji.x >= 380) oji.x = 380;
				if (oji.y <= 0) oji.y = 0;
				if (oji.y >= 460) oji.y = 460;
				ojiX = oji.x;
				ojiY = oji.y;
				if (oji.hp <= 0) {
					stageBGM.stop();
					state = 99;
					genePoint += point;
					// 敵全削除
					for (var i = 0; i < enemyArray.length; i++) {
						if (enemyArray[i] != null) {
							enemyArray[i].parentNode.removeChild(enemyArray[i]);
							enemyArray[i] = null;
						}
					}
					// 弾全削除
					for (var i = 0; i < bulletArray.length; i++) {
						if (bulletArray[i] != null) {
							bulletArray[i].parentNode.removeChild(bulletArray[i]);
							bulletArray[i] = null;
						}
					}
					core.popScene();
					core.pushScene(S_Start);
				}
			}
		};
		//////////////////////////////////////////////メインループ終了////////////////////////////////////////////////////////////
	};
	core.start();
};