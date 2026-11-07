/**
 * 🦁🐬 KidsGate 3D - Articulated Multi-Part Animals Engine (陸10種 ＋ 海10種)
 * パーツごとに独立した関節ピボット（足・膝・鼻・耳・首・アゴ・しっぽ・ヒレ・触腕・ハサミ）を持ち、
 * 単一数理モデル computeState(speciesId, input) によって全身が連動して動く3D動物モジュール。
 * どのフォルダのゲームからでも 1ファイル読み込みで即座に利用可能。
 */
(function (global) {
  'use strict';

  const DEG2RAD = Math.PI / 180;

  // ===========================================================================
  // 1. 動物20種類のカタログ定義（陸の動物10種 ＋ 海の動物10種）
  // ===========================================================================
  const SPECIES_CATALOG = [
    // --- 🌿 陸の動物 10種類 ---
    {
      id: 'elephant',
      title: 'パオパオぞうさん',
      enTitle: 'Articulated Elephant',
      habitat: 'land',
      icon: '🐘',
      gimmickName: '3段可動の長い鼻カール＆大きな耳パタパタ',
      partsSummary: '胴体 / 頭・首 / 3関節の鼻 / 左右の大耳 / キバ / 2関節×4本脚 / しっぽ (計18パーツ)'
    },
    {
      id: 'lion',
      title: '百獣の王ライオン',
      enTitle: 'Articulated Lion',
      habitat: 'land',
      icon: '🦁',
      gimmickName: 'ガオー！と開くアゴ＆揺れるタテガミ＆4本脚歩行',
      partsSummary: '胴体 / 頭 / 可動下アゴ / タテガミリング / 左右耳 / 2関節×4本脚 / 房付きしっぽ (計16パーツ)'
    },
    {
      id: 'giraffe',
      title: 'のっぽのキリンさん',
      enTitle: 'Articulated Giraffe',
      habitat: 'land',
      icon: '🦒',
      gimmickName: '2段関節の長い首しなり＆優雅な長い4本脚ウォーキング',
      partsSummary: '斑点胴体 / 下首・上首2関節 / 頭・ツノ / 左右耳 / 2関節×4本長脚 / しっぽ (計17パーツ)'
    },
    {
      id: 'panda',
      title: 'コロコロパンダちゃん',
      enTitle: 'Articulated Panda',
      habitat: 'land',
      icon: '🐼',
      gimmickName: '首かしげ＆笹振り前あしアクション＆よちよち歩行',
      partsSummary: '白黒胴体 / 頭・黒目パッチ / 左右丸耳 / 笹付き可動腕 / 2関節×4本脚 / 丸しっぽ (計16パーツ)'
    },
    {
      id: 'rabbit',
      title: 'ぴょんぴょんウサギ',
      enTitle: 'Articulated Rabbit',
      habitat: 'land',
      icon: '🐰',
      gimmickName: '2段で折れ曲がる長い立ち耳ピョコピョコ＆ホッピング脚',
      partsSummary: '胴体 / 頭・ほっぺ / 2関節×左右長耳 / 前あし2本 / バネ付き後ろ脚2本 / 丸しっぽ (計16パーツ)'
    },
    {
      id: 'bear',
      title: 'もりのクマさん',
      enTitle: 'Articulated Bear',
      habitat: 'land',
      icon: '🐻',
      gimmickName: 'パクパク動く口＆バンザイ前あし＆のっしのっし歩行',
      partsSummary: '胴体 / 頭 / 可動下アゴ / 左右丸耳 / 2関節×4本脚 / 丸しっぽ (計15パーツ)'
    },
    {
      id: 'tiger',
      title: 'しましまトラくん',
      enTitle: 'Articulated Tiger',
      habitat: 'land',
      icon: '🐯',
      gimmickName: '咆哮するアゴ＆3段S字にしなる長い縞しっぽ＆4本脚疾走',
      partsSummary: '虎縞胴体 / 頭 / 可動アゴ / 左右耳 / 2関節×4本脚 / 3関節しっぽ (計17パーツ)'
    },
    {
      id: 'dog',
      title: 'わんぱく柴犬くん',
      enTitle: 'Articulated Shiba Dog',
      habitat: 'land',
      icon: '🐕',
      gimmickName: '高速ブンブンくるりん巻き尾＆三角耳ピクピク＆軽快トロット歩行',
      partsSummary: '胴体・赤首輪 / 頭 / 可動アゴ / 左右三角耳 / 2関節×4本脚 / 2関節巻き尾 (計16パーツ)'
    },
    {
      id: 'cat',
      title: 'すやすやミケネコ',
      enTitle: 'Articulated Calico Cat',
      habitat: 'land',
      icon: '🐱',
      gimmickName: '招き猫ポーズ前あし＆3段S字しっぽ＆しなやかキャットウォーク',
      partsSummary: '三毛胴体 / 頭 / 左右三角耳 / 2関節×4本脚 / 3関節長しっぽ (計16パーツ)'
    },
    {
      id: 'koala',
      title: 'のんびりコアラくん',
      enTitle: 'Articulated Koala',
      habitat: 'land',
      icon: '🐨',
      gimmickName: '大きなフサフサ丸耳パタパタ＆木登りハグ両腕アクション',
      partsSummary: '胴体 / 頭・大黒鼻 / フサフサ大耳L・R / 2関節×4本手足 (計14パーツ)'
    },

    // --- 🌊 海の動物 10種類 ---
    {
      id: 'whale',
      title: 'おおきなクジラさん',
      enTitle: 'Articulated Whale',
      habitat: 'sea',
      icon: '🐳',
      gimmickName: '大きく開く下アゴ＆2段ドルフィンキック尾びれ＆潮吹きスプラッシュ',
      partsSummary: '巨体胴体 / 可動下アゴ / 左右胸びれ / 後胴・水平尾びれ2関節 / 潮吹きエフェクト (計12パーツ)'
    },
    {
      id: 'shark',
      title: 'わくわくサメくん',
      enTitle: 'Articulated Shark',
      habitat: 'sea',
      icon: '🦈',
      gimmickName: 'ガブッと開く歯並びアゴ＆3段S字うねりボディ＆三日月尾びれ',
      partsSummary: '前胴 / 頭・歯並び上顎 / 可動下アゴ / 背びれ / 左右胸びれ / 中胴・尾胴・尾びれ3関節 (計13パーツ)'
    },
    {
      id: 'turtle',
      title: 'ゆったりウミガメ',
      enTitle: 'Articulated Sea Turtle',
      habitat: 'sea',
      icon: '🐢',
      gimmickName: '甲羅から伸び縮みする首＆翼のように羽ばたく4枚のヒレ',
      partsSummary: '六角模様ドーム甲羅 / 伸縮首・頭 / 2関節×前ヒレL・R / 後ろヒレL・R / しっぽ (計13パーツ)'
    },
    {
      id: 'octopus',
      title: 'ぷりぷりタコさん',
      enTitle: 'Articulated Octopus',
      habitat: 'sea',
      icon: '🐙',
      gimmickName: '8本の足がそれぞれ2段関節（計16関節）で独立してウネウネ波打つ！',
      partsSummary: '伸縮丸頭 / ひょっとこ口漏斗 / 2関節×8本触腕 (計20パーツ)'
    },
    {
      id: 'squid',
      title: 'スイスイいかさん',
      enTitle: 'Articulated Squid',
      habitat: 'sea',
      icon: '🦑',
      gimmickName: 'パタパタ波打つ三角エンペラ＆ビュッと伸びる2本の長い触腕＋8本腕',
      partsSummary: '外套膜ボディ / 左右三角エンペラ / 頭部 / 8本短腕 + 2関節×2本長触腕 (計17パーツ)'
    },
    {
      id: 'crab',
      title: 'チョキチョキカニさん',
      enTitle: 'Articulated Crab',
      habitat: 'sea',
      icon: '🦀',
      gimmickName: 'バンザイして開閉する両大ハサミ＆横歩きでワシャワシャ動く6本脚',
      partsSummary: '赤甲羅 / 伸縮目柄L・R / 腕＋可動ツメ×左右大ハサミ / 2関節×6本歩脚 (計21パーツ)'
    },
    {
      id: 'clownfish',
      title: 'カクレクマノミちゃん',
      enTitle: 'Articulated Clownfish',
      habitat: 'sea',
      icon: '🐠',
      gimmickName: '丸い胸びれパタパタ高速羽ばたき＆プリプリ尾びれスイング',
      partsSummary: '3本白帯ボディ / パクパク口 / 背びれ / 左右丸胸びれ / 後胴・丸尾びれ2関節 (計11パーツ)'
    },
    {
      id: 'orca',
      title: '海の王者シャチくん',
      enTitle: 'Articulated Orca',
      habitat: 'sea',
      icon: '🐋',
      gimmickName: '力強い上下ドルフィンキック尾びれ＆パドル胸びれ＆開閉アゴ',
      partsSummary: '白黒ツヤ胴体 / アイパッチ頭部 / 可動下アゴ / 大背びれ / 左右胸びれ / 尾胴・尾びれ2関節 (計12パーツ)'
    },
    {
      id: 'manta',
      title: '空飛ぶマンタエイ',
      enTitle: 'Articulated Manta Ray',
      habitat: 'sea',
      icon: '🐟',
      gimmickName: '鳥の翼のように2段関節で優雅にしなる左右の巨大ヒレ羽ばたき',
      partsSummary: '中央ディスク胴体 / 内翼・外翼2関節×左右 / 頭びれL・R / 2関節ムチ状長尾 (計13パーツ)'
    },
    {
      id: 'seal',
      title: 'ゴマフアザラシちゃん',
      enTitle: 'Articulated Spotted Seal',
      habitat: 'sea',
      icon: '🦭',
      gimmickName: 'お腹ペチペチ拍手する前ヒレ＆キョロキョロ首持ち上げ＆後ろヒレ',
      partsSummary: 'ゴマ模様胴体 / 伸縮首・頭・ぷっくりマズル / 2関節×前ヒレL・R / 後ろ尾ヒレL・R (計13パーツ)'
    }
  ];

  // ===========================================================================
  // 2. 共通マテリアル＆ヘルパー関数
  // ===========================================================================
  function makeMat(hex, roughness = 0.42, metalness = 0.06) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      roughness,
      metalness
    });
  }

  // 角丸感のあるカプセル・楕円パーツ生成ヘルパー
  function makeEllipsoidMesh(rx, ry, rz, mat, segs = 20) {
    const geo = new THREE.SphereGeometry(1, segs, Math.max(12, Math.floor(segs * 0.8)));
    geo.scale(rx, ry, rz);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function makeTaperedCylinderMesh(rTop, rBtm, height, mat, segs = 18) {
    const geo = new THREE.CylinderGeometry(rTop, rBtm, height, segs);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // 可愛い目パーツ（白目＋虹彩＋黒目＋キラッとハイライト2点＋まぶたピボット）
  function createCuteEyePair(spreadX, y, z, radius, irisHex, yawDeg = 16) {
    const eyeGroup = new THREE.Group();
    eyeGroup.name = 'EyesGroup';
    const whiteMat = makeMat(0xffffff, 0.2, 0.05);
    const irisMat = makeMat(irisHex, 0.25, 0.1);
    const pupilMat = makeMat(0x0f172a, 0.15, 0.1);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-1, 1].forEach((side) => {
      const holder = new THREE.Group();
      holder.position.set(side * spreadX, y, z);
      holder.rotation.y = side * yawDeg * DEG2RAD;

      const sclera = makeEllipsoidMesh(radius, radius, radius * 0.85, whiteMat, 16);
      holder.add(sclera);

      const iris = makeEllipsoidMesh(radius * 0.68, radius * 0.68, radius * 0.35, irisMat, 14);
      iris.position.z = radius * 0.66;
      holder.add(iris);

      const pupil = makeEllipsoidMesh(radius * 0.46, radius * 0.46, radius * 0.25, pupilMat, 12);
      pupil.position.z = radius * 0.82;
      holder.add(pupil);

      const glint1 = makeEllipsoidMesh(radius * 0.18, radius * 0.18, radius * 0.12, glintMat, 8);
      glint1.position.set(side * radius * 0.2, radius * 0.24, radius * 0.96);
      holder.add(glint1);

      const glint2 = makeEllipsoidMesh(radius * 0.09, radius * 0.09, radius * 0.08, glintMat, 8);
      glint2.position.set(-side * radius * 0.18, -radius * 0.18, radius * 0.94);
      holder.add(glint2);

      eyeGroup.add(holder);
    });
    return eyeGroup;
  }

  // 関節ピボット登録ヘルパー（初期座標・回転・分解オフセット・サブシステム分類を保存）
  function registerPart(rig, key, group, subsystem, explodeVec, labelTitle = null) {
    group.name = key;
    const entry = {
      key,
      group,
      subsystem, // 'head' | 'body' | 'frontLimbs' | 'rearLimbs' | 'tailGimmick'
      basePos: group.position.clone(),
      baseRot: new THREE.Euler(group.rotation.x, group.rotation.y, group.rotation.z),
      baseScale: group.scale.clone(),
      explodeOffset: explodeVec ? new THREE.Vector3(explodeVec[0], explodeVec[1], explodeVec[2]) : new THREE.Vector3(),
      labelTitle
    };

    // 関節ピボット可視化マーカー（スケルトン透視モード時に光る球）
    const jointMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: false })
    );
    jointMarker.visible = false;
    jointMarker.name = `joint_${key}`;
    group.add(jointMarker);
    entry.jointMarker = jointMarker;

    rig.parts[key] = entry;
    rig.partList.push(entry);
    return group;
  }

  // 2関節の脚（肩/股関節 -> 膝 -> 足先）を作成する共通ヘルパー
  function buildTwoJointLeg(rig, keyPrefix, x, y, z, upperLen, lowerLen, rTop, rMid, rFoot, mainMat, footMat, subsystem, expDir) {
    const upperPivot = new THREE.Group();
    upperPivot.position.set(x, y, z);

    const topCap = makeEllipsoidMesh(rTop, rTop, rTop, mainMat, 14);
    upperPivot.add(topCap);

    const upperCyl = makeTaperedCylinderMesh(rTop, rMid, upperLen, mainMat, 16);
    upperCyl.position.y = -upperLen * 0.5;
    upperPivot.add(upperCyl);

    const lowerPivot = new THREE.Group();
    lowerPivot.position.set(0, -upperLen, 0);
    upperPivot.add(lowerPivot);

    const kneeBall = makeEllipsoidMesh(rMid * 1.02, rMid * 1.02, rMid * 1.02, mainMat, 12);
    lowerPivot.add(kneeBall);

    const lowerCyl = makeTaperedCylinderMesh(rMid, rFoot * 0.92, lowerLen, mainMat, 16);
    lowerCyl.position.y = -lowerLen * 0.5;
    lowerPivot.add(lowerCyl);

    const paw = makeEllipsoidMesh(rFoot * 1.15, rFoot * 0.62, rFoot * 1.35, footMat || mainMat, 14);
    paw.position.set(0, -lowerLen, rFoot * 0.22);
    lowerPivot.add(paw);

    registerPart(rig, `${keyPrefix}_Upper`, upperPivot, subsystem, expDir);
    registerPart(rig, `${keyPrefix}_Lower`, lowerPivot, subsystem, [0, -0.25, 0]);
    return { upperPivot, lowerPivot };
  }

  // 多関節チェーン（象の鼻・長いしっぽ・タコの足など）を作成するヘルパー
  function buildMultiJointChain(rig, keyPrefix, count, startPos, segLengths, segRadii, axisDir, mat, tipMat, subsystem, expBase) {
    const segments = [];
    let parentGroup = null;

    for (let i = 0; i < count; i++) {
      const segGroup = new THREE.Group();
      if (i === 0) {
        segGroup.position.set(startPos[0], startPos[1], startPos[2]);
      } else {
        const prevLen = segLengths[i - 1];
        segGroup.position.set(axisDir[0] * prevLen, axisDir[1] * prevLen, axisDir[2] * prevLen);
      }

      const len = segLengths[i];
      const r0 = segRadii[i];
      const r1 = segRadii[i + 1] !== undefined ? segRadii[i + 1] : r0 * 0.75;
      const useMat = (i === count - 1 && tipMat) ? tipMat : mat;

      const jointSphere = makeEllipsoidMesh(r0, r0, r0, useMat, 14);
      segGroup.add(jointSphere);

      const cyl = makeTaperedCylinderMesh(r0, r1, len, useMat, 16);
      // 軸方向に合わせてシリンダーを配置
      if (Math.abs(axisDir[2]) > 0.5) {
        cyl.rotation.x = axisDir[2] > 0 ? Math.PI / 2 : -Math.PI / 2;
        cyl.position.z = axisDir[2] * len * 0.5;
      } else if (Math.abs(axisDir[0]) > 0.5) {
        cyl.rotation.z = axisDir[0] > 0 ? -Math.PI / 2 : Math.PI / 2;
        cyl.position.x = axisDir[0] * len * 0.5;
      } else {
        cyl.position.y = axisDir[1] * len * 0.5;
      }
      segGroup.add(cyl);

      if (i === count - 1) {
        const tipCap = makeEllipsoidMesh(r1 * 1.15, r1 * 1.15, r1 * 1.15, useMat, 12);
        tipCap.position.set(axisDir[0] * len, axisDir[1] * len, axisDir[2] * len);
        segGroup.add(tipCap);
      }

      const exp = i === 0 ? expBase : [axisDir[0] * 0.22, axisDir[1] * 0.22, axisDir[2] * 0.22];
      registerPart(rig, `${keyPrefix}_${i + 1}`, segGroup, subsystem, exp);

      if (parentGroup) parentGroup.add(segGroup);
      parentGroup = segGroup;
      segments.push(segGroup);
    }

    return segments;
  }

  // ===========================================================================
  // 3. 動物ごとの3Dパーツ階層組み立て関数
  // ===========================================================================
  function createGlbAnimalRig(speciesId, base64Data) {
    const root = new THREE.Group();
    root.name = `Articulated_${speciesId}_GLB`;

    const rig = {
      speciesId,
      root,
      parts: {},
      partList: [],
      materials: [],
      isGlbMasterpiece: true,
      autoAnimate: false,
      autoParams: { speed: 65, gimmick: 55, turnDeg: 0, lively: 65, explodeProgress: 0 }
    };
    root.userData.articulatedRig = rig;

    const binStr = atob(base64Data);
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);

    const loader = new THREE.GLTFLoader();
    loader.parse(bytes.buffer, '', (gltf) => {
      const scene = gltf.scene;
      root.add(scene);

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.material) {
            obj.material.vertexColors = true;
            obj.material.roughness = 0.48;
            obj.material.metalness = 0.05;
            rig.materials.push(obj.material);
          }
        }

        if (obj.name && !obj.name.endsWith('_mesh') && obj !== scene) {
          const name = obj.name;
          let subsystem = 'body';
          let explodeDir = new THREE.Vector3(0, 0, 0);
          let label = name;

          if (name === 'Body' || name.startsWith('DiscBody') || name.startsWith('Carapace') || name.startsWith('Mantle')) {
            subsystem = 'body';
            explodeDir.set(0, 0.15, 0);
            label = '胴体フレーム';
          } else if (name === 'Head' || name === 'NeckHead') {
            subsystem = 'head';
            explodeDir.set(0, 0.55, 0.85);
            label = '頭部ユニット';
          } else if (name === 'Jaw') {
            subsystem = 'head';
            explodeDir.set(0, -0.40, 0.50);
            label = '可動下アゴ';
          } else if (name.startsWith('Trunk')) {
            subsystem = 'head';
            explodeDir.set(0, 0.20, 1.20);
            label = '可動鼻ギミック';
          } else if (name.startsWith('Ear_L')) {
            subsystem = 'head';
            explodeDir.set(-0.85, 0.35, 0.1);
            label = '左耳パネル';
          } else if (name.startsWith('Ear_R')) {
            subsystem = 'head';
            explodeDir.set(0.85, 0.35, 0.1);
            label = '右耳パネル';
          } else if (name.startsWith('Horn_L')) {
            subsystem = 'head';
            explodeDir.set(-0.35, 0.85, 0);
            label = '左ツノ';
          } else if (name.startsWith('Horn_R')) {
            subsystem = 'head';
            explodeDir.set(0.35, 0.85, 0);
            label = '右ツノ';
          } else if (name === 'Leg_FL' || name === 'Flipper_FL' || name === 'Claw_L') {
            subsystem = 'frontLimbs';
            explodeDir.set(-0.65, -0.25, 0.55);
            label = '左前肢／ハサミ';
          } else if (name === 'Leg_FR' || name === 'Flipper_FR' || name === 'Claw_R') {
            subsystem = 'frontLimbs';
            explodeDir.set(0.65, -0.25, 0.55);
            label = '右前肢／ハサミ';
          } else if (name === 'Leg_RL' || name === 'Flipper_RL') {
            subsystem = 'rearLimbs';
            explodeDir.set(-0.65, -0.25, -0.65);
            label = '左後肢／ヒレ';
          } else if (name === 'Leg_RR' || name === 'Flipper_RR') {
            subsystem = 'rearLimbs';
            explodeDir.set(0.65, -0.25, -0.65);
            label = '右後肢／ヒレ';
          } else if (name === 'Tail' || name === 'Fluke' || name.startsWith('Fin_Caudal') || name === 'Flipper_Rear') {
            subsystem = 'tailGimmick';
            explodeDir.set(0, 0.25, -1.15);
            label = 'しっぽ・尾びれ';
          } else if (name === 'Flipper_L' || name === 'Wing_L' || name === 'Fin_Pectoral_L') {
            subsystem = 'frontLimbs';
            explodeDir.set(-1.15, 0.15, 0.1);
            label = '左胸びれ・翼';
          } else if (name === 'Flipper_R' || name === 'Wing_R' || name === 'Fin_Pectoral_R') {
            subsystem = 'frontLimbs';
            explodeDir.set(1.15, 0.15, 0.1);
            label = '右胸びれ・翼';
          } else if (name === 'Dorsal_Fin' || name === 'Fin_Dorsal') {
            subsystem = 'body';
            explodeDir.set(0, 0.95, 0);
            label = '背びれ';
          } else if (name.startsWith('Arm_') || name.startsWith('Tentacle')) {
            subsystem = 'frontLimbs';
            explodeDir.set(obj.position.x * 2.2, -0.35, obj.position.z * 2.2);
            label = '可動腕・触手';
          } else if (name.startsWith('Leg_')) {
            subsystem = 'frontLimbs';
            explodeDir.set(obj.position.x * 2.0, -0.25, obj.position.z * 1.5);
            label = '歩脚';
          } else if (name.startsWith('Cephalic_')) {
            subsystem = 'head';
            explodeDir.set(obj.position.x * 2.0, 0, 0.65);
            label = '頭鰭';
          }

          const partObj = {
            name,
            group: obj,
            subsystem,
            labelTitle: label,
            basePos: obj.position.clone(),
            baseRot: obj.rotation.clone(),
            baseScale: obj.scale.clone(),
            explodeOffset: explodeDir
          };
          rig.parts[name] = partObj;
          rig.partList.push(partObj);
        }
      });
    });

    return rig;
  }

  function createAnimalRig(speciesId) {
    // If high-detail multi-node GLB exists in window.MODELS_BASE64_DATA, load and bind it!
    if (typeof window !== 'undefined' && window.MODELS_BASE64_DATA && window.MODELS_BASE64_DATA[speciesId] && typeof THREE !== 'undefined' && THREE.GLTFLoader) {
      return createGlbAnimalRig(speciesId, window.MODELS_BASE64_DATA[speciesId]);
    }

    const root = new THREE.Group();
    root.name = `Articulated_${speciesId}`;

    const rig = {
      speciesId,
      root,
      parts: {},
      partList: [],
      materials: [],
      autoAnimate: false,
      autoParams: { speed: 65, gimmick: 55, turnDeg: 0, lively: 65, explodeProgress: 0 }
    };
    root.userData.articulatedRig = rig;

    const bodyPivot = new THREE.Group();
    bodyPivot.position.set(0, 0.72, 0);
    root.add(bodyPivot);
    registerPart(rig, 'Body', bodyPivot, 'body', [0, 0.15, 0], '胴体（メインボディ）');

    // -------------------------------------------------------------------------
    // 1. 🐘 パオパオぞうさん (Elephant) - 象徴的なフラッグシップ可動モデル
    // -------------------------------------------------------------------------
    if (speciesId === 'elephant') {
      const mMain = makeMat(0x8899b0, 0.42);
      const mBelly = makeMat(0xcbd5e1, 0.48);
      const mPink = makeMat(0xf48fb1, 0.45);
      const mIvory = makeMat(0xfef9c3, 0.30);

      // ぷっくり丸い胴体＋お腹パッチ
      bodyPivot.add(makeEllipsoidMesh(0.56, 0.48, 0.68, mMain, 24));
      const belly = makeEllipsoidMesh(0.44, 0.36, 0.54, mBelly, 18);
      belly.position.set(0, -0.14, 0.02);
      bodyPivot.add(belly);

      // 首・頭ピボット（うなずき・首かしげ・左右旋回）
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.26, 0.58);
      bodyPivot.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.55, 0.65], '頭部＆表情ギミック');

      headPivot.add(makeEllipsoidMesh(0.44, 0.42, 0.42, mMain, 22));
      headPivot.add(createCuteEyePair(0.26, 0.08, 0.34, 0.085, 0x1d4ed8, 22));

      // 左右の大きなパタパタ耳ピボット
      [-1, 1].forEach((side) => {
        const key = side < 0 ? 'Ear_L' : 'Ear_R';
        const earPivot = new THREE.Group();
        earPivot.position.set(side * 0.36, 0.06, -0.04);
        headPivot.add(earPivot);
        registerPart(rig, key, earPivot, 'head', [side * 0.75, 0.25, 0], side < 0 ? '左の大きな耳' : null);

        const outerEar = makeEllipsoidMesh(0.36, 0.46, 0.09, mMain, 18);
        outerEar.position.set(side * 0.22, -0.04, 0);
        outerEar.rotation.z = side * -0.12;
        earPivot.add(outerEar);

        const innerEar = makeEllipsoidMesh(0.25, 0.34, 0.05, mPink, 16);
        innerEar.position.set(side * 0.21, -0.05, 0.05);
        innerEar.rotation.z = side * -0.12;
        earPivot.add(innerEar);
      });

      // 左右の白いキバ（タスク）
      [-1, 1].forEach((side) => {
        const tuskPivot = new THREE.Group();
        tuskPivot.position.set(side * 0.21, -0.16, 0.32);
        tuskPivot.rotation.x = 0.55;
        tuskPivot.rotation.z = side * 0.18;
        headPivot.add(tuskPivot);
        registerPart(rig, side < 0 ? 'Tusk_L' : 'Tusk_R', tuskPivot, 'head', [side * 0.3, -0.2, 0.5]);

        const tuskMesh = makeTaperedCylinderMesh(0.025, 0.068, 0.38, mIvory, 14);
        tuskMesh.position.y = 0.16;
        tuskPivot.add(tuskMesh);
      });

      // 3段関節の長い鼻（Trunk_1 -> Trunk_2 -> Trunk_3：上下カール＆左右スイング）
      const trunkSegs = buildMultiJointChain(
        rig,
        'Trunk',
        3,
        [0, -0.06, 0.38],
        [0.28, 0.26, 0.24],
        [0.16, 0.13, 0.10, 0.085],
        [0, 0, 1],
        mMain,
        mPink,
        'head',
        [0, 0.1, 0.85]
      );
      headPivot.add(trunkSegs[0]);
      rig.parts['Trunk_1'].labelTitle = '3段関節の長い鼻';

      // 4本の太い足（肩/股関節＋膝/足首の2関節×4本）
      const legCoords = [
        { key: 'Leg_FL', x: -0.32, z: 0.36, sub: 'frontLimbs', exp: [-0.65, -0.45, 0.35], lbl: '前あし（2関節）' },
        { key: 'Leg_FR', x:  0.32, z: 0.36, sub: 'frontLimbs', exp: [ 0.65, -0.45, 0.35], lbl: null },
        { key: 'Leg_RL', x: -0.32, z: -0.38, sub: 'rearLimbs', exp: [-0.65, -0.45, -0.35], lbl: '後ろあし（2関節）' },
        { key: 'Leg_RR', x:  0.32, z: -0.38, sub: 'rearLimbs', exp: [ 0.65, -0.45, -0.35], lbl: null }
      ];
      legCoords.forEach((lc) => {
        const leg = buildTwoJointLeg(rig, lc.key, lc.x, -0.22, lc.z, 0.26, 0.24, 0.17, 0.15, 0.16, mMain, mIvory, lc.sub, lc.exp);
        bodyPivot.add(leg.upperPivot);
        if (lc.lbl) rig.parts[`${lc.key}_Upper`].labelTitle = lc.lbl;
      });

      // パタパタ揺れるしっぽ
      const tailSegs = buildMultiJointChain(
        rig, 'Tail', 2, [0, 0.05, -0.64], [0.22, 0.18], [0.06, 0.045, 0.07], [0, 0, -1], mMain, mBelly, 'tailGimmick', [0, 0.2, -0.75]
      );
      tailSegs[0].rotation.x = -0.65;
      rig.parts['Tail_1'].baseRot.copy(tailSegs[0].rotation);
      rig.parts['Tail_1'].labelTitle = '可動しっぽ';
      bodyPivot.add(tailSegs[0]);
    }

    // -------------------------------------------------------------------------
    // 2. 🦁〜🐨 その他の陸の動物9種類（すべて頭・耳・アゴ・2関節4本脚・多関節しっぽ搭載）
    // -------------------------------------------------------------------------
    else if (['lion', 'giraffe', 'panda', 'rabbit', 'bear', 'tiger', 'dog', 'cat', 'koala'].includes(speciesId)) {
      const palettes = {
        lion:    { main: 0xf59e0b, belly: 0xfef3c7, acc1: 0x78350f, acc2: 0xfca5a5, iris: 0xb45309 },
        giraffe: { main: 0xfacc15, belly: 0xfef9c3, acc1: 0x92400e, acc2: 0xfde047, iris: 0x78350f },
        panda:   { main: 0xf8fafc, belly: 0xffffff, acc1: 0x18181b, acc2: 0xfb7185, iris: 0x3f3f46 },
        rabbit:  { main: 0xffe4e6, belly: 0xffffff, acc1: 0xfb7185, acc2: 0xffffff, iris: 0xe11d48 },
        bear:    { main: 0xa16207, belly: 0xfef3c7, acc1: 0x451a03, acc2: 0xfde68a, iris: 0x451a03 },
        tiger:   { main: 0xf97316, belly: 0xffedd5, acc1: 0x18181b, acc2: 0xfda4af, iris: 0xca8a04 },
        dog:     { main: 0xea8a2e, belly: 0xfef9e7, acc1: 0x1e1b18, acc2: 0xef4444, iris: 0x5c2d0c },
        cat:     { main: 0xfef3c7, belly: 0xffffff, acc1: 0xea580c, acc2: 0xf472b6, iris: 0x10b981 },
        koala:   { main: 0x94a3b8, belly: 0xf1f5f9, acc1: 0x1e293b, acc2: 0xe2e8f0, iris: 0x334155 }
      };
      const pal = palettes[speciesId];
      const mMain = makeMat(pal.main, 0.42);
      const mBelly = makeMat(pal.belly, 0.46);
      const mAcc1 = makeMat(pal.acc1, 0.45);
      const mAcc2 = makeMat(pal.acc2, 0.42);

      // 胴体
      const isTall = speciesId === 'giraffe';
      if (isTall) bodyPivot.position.y = 0.92;
      bodyPivot.add(makeEllipsoidMesh(0.44, 0.38, 0.58, mMain, 22));
      const bellyMesh = makeEllipsoidMesh(0.35, 0.30, 0.46, mBelly, 16);
      bellyMesh.position.set(0, -0.10, 0.04);
      bodyPivot.add(bellyMesh);

      // パンダの黒肩バンド / トラの縞バンド / キリンの斑点 / 柴犬の赤い首輪
      if (speciesId === 'panda') {
        const band = makeEllipsoidMesh(0.46, 0.39, 0.24, mAcc1, 18);
        band.position.set(0, 0.02, 0.20);
        bodyPivot.add(band);
      } else if (speciesId === 'tiger') {
        [-0.28, 0, 0.26].forEach((sz) => {
          const stripe = makeEllipsoidMesh(0.45, 0.36, 0.07, mAcc1, 16);
          stripe.position.set(0, 0.04, sz);
          bodyPivot.add(stripe);
        });
      } else if (speciesId === 'giraffe') {
        [[-0.32, 0.1, 0.15], [0.32, 0.08, -0.12], [-0.28, 0.12, -0.25], [0.28, 0.1, 0.22]].forEach((sp) => {
          const spot = makeEllipsoidMesh(0.14, 0.12, 0.14, mAcc1, 12);
          spot.position.set(sp[0], sp[1], sp[2]);
          bodyPivot.add(spot);
        });
      } else if (speciesId === 'dog') {
        const collar = makeEllipsoidMesh(0.36, 0.32, 0.12, mAcc2, 16);
        collar.position.set(0, 0.12, 0.44);
        collar.rotation.x = 0.35;
        bodyPivot.add(collar);
      } else if (speciesId === 'cat') {
        const patch = makeEllipsoidMesh(0.26, 0.22, 0.28, mAcc1, 14);
        patch.position.set(0.16, 0.16, -0.08);
        bodyPivot.add(patch);
      }

      // 首・頭ピボット（キリンは2段の長首！）
      let headParent = bodyPivot;
      let headBasePos = [0, 0.32, 0.52];
      if (speciesId === 'giraffe') {
        const neckSegs = buildMultiJointChain(
          rig, 'Neck', 2, [0, 0.22, 0.38], [0.44, 0.42], [0.19, 0.15, 0.13], [0, 1, 0], mMain, mMain, 'head', [0, 0.55, 0.35]
        );
        neckSegs[0].rotation.x = 0.28;
        rig.parts['Neck_1'].baseRot.copy(neckSegs[0].rotation);
        rig.parts['Neck_1'].labelTitle = '2関節の長い首';
        bodyPivot.add(neckSegs[0]);
        headParent = neckSegs[1];
        headBasePos = [0, 0.44, 0.06];
      }

      const headPivot = new THREE.Group();
      headPivot.position.set(headBasePos[0], headBasePos[1], headBasePos[2]);
      headParent.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.55, 0.55], '頭部＆表情ギミック');

      // ライオンのタテガミリング（独立可動パーツ）
      if (speciesId === 'lion') {
        const manePivot = new THREE.Group();
        headPivot.add(manePivot);
        registerPart(rig, 'Mane', manePivot, 'head', [0, 0.35, -0.35], 'ふわふわタテガミ');
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const puff = makeEllipsoidMesh(0.20, 0.20, 0.20, mAcc1, 12);
          puff.position.set(Math.sin(a) * 0.38, Math.cos(a) * 0.38, -0.05);
          manePivot.add(puff);
        }
      }

      const headRadius = speciesId === 'giraffe' ? 0.26 : 0.38;
      headPivot.add(makeEllipsoidMesh(headRadius, headRadius * 0.92, headRadius * 0.95, mMain, 20));

      // パンダの黒目パッチ
      if (speciesId === 'panda') {
        [-1, 1].forEach((s) => {
          const ep = makeEllipsoidMesh(0.13, 0.15, 0.08, mAcc1, 12);
          ep.position.set(s * 0.17, 0.04, 0.32);
          ep.rotation.z = s * 0.28;
          headPivot.add(ep);
        });
      }

      // マズル＆可動下アゴ（Jaw）
      const snout = makeEllipsoidMesh(headRadius * 0.52, headRadius * 0.38, headRadius * 0.45, mBelly, 16);
      snout.position.set(0, -headRadius * 0.22, headRadius * 0.82);
      headPivot.add(snout);

      const nose = makeEllipsoidMesh(
        speciesId === 'koala' ? 0.09 : headRadius * 0.20,
        speciesId === 'koala' ? 0.14 : headRadius * 0.15,
        headRadius * 0.16,
        speciesId === 'lion' || speciesId === 'rabbit' || speciesId === 'cat' ? mAcc2 : mAcc1,
        12
      );
      nose.position.set(0, -headRadius * 0.10, headRadius * 1.15);
      headPivot.add(nose);

      // 開閉する下アゴ（ガオー！やモグモグアクション用）
      const jawPivot = new THREE.Group();
      jawPivot.position.set(0, -headRadius * 0.42, headRadius * 0.45);
      headPivot.add(jawPivot);
      registerPart(rig, 'Jaw', jawPivot, 'head', [0, -0.28, 0.45], '開閉する下アゴ');
      const jawMesh = makeEllipsoidMesh(headRadius * 0.40, headRadius * 0.18, headRadius * 0.42, mBelly, 14);
      jawMesh.position.set(0, 0, headRadius * 0.28);
      jawPivot.add(jawMesh);

      // 瞳ペア
      headPivot.add(createCuteEyePair(headRadius * 0.46, headRadius * 0.12, headRadius * 0.78, headRadius * 0.20, pal.iris, 18));

      // 左右の耳ピボット（ウサギは2段関節の長耳、コアラは大きなフサフサ耳）
      [-1, 1].forEach((side) => {
        const key = side < 0 ? 'Ear_L' : 'Ear_R';
        if (speciesId === 'rabbit') {
          const earChain = buildMultiJointChain(
            rig, key, 2,
            [side * 0.16, 0.30, -0.04],
            [0.28, 0.26],
            [0.095, 0.085, 0.06],
            [0, 1, 0],
            mMain, mAcc1, 'head', [side * 0.35, 0.65, 0]
          );
          headPivot.add(earChain[0]);
          if (side < 0) rig.parts[`${key}_1`].labelTitle = '2段可動の長い耳';
        } else {
          const earPivot = new THREE.Group();
          const earX = speciesId === 'koala' ? side * 0.38 : side * headRadius * 0.75;
          const earY = speciesId === 'koala' ? 0.12 : headRadius * 0.78;
          earPivot.position.set(earX, earY, -0.04);
          headPivot.add(earPivot);
          registerPart(rig, key, earPivot, 'head', [side * 0.48, 0.45, 0], side < 0 ? '可動の耳' : null);

          const earMat = (speciesId === 'panda' || speciesId === 'tiger') ? mAcc1 : mMain;
          const earRx = speciesId === 'koala' ? 0.22 : headRadius * 0.34;
          const earRy = (speciesId === 'dog' || speciesId === 'cat') ? headRadius * 0.52 : (speciesId === 'koala' ? 0.22 : headRadius * 0.34);
          const earMesh = makeEllipsoidMesh(earRx, earRy, 0.08, earMat, 14);
          earMesh.position.y = earRy * 0.45;
          earPivot.add(earMesh);
        }
      });

      // キリンの可愛いツノ（オシコーン）
      if (speciesId === 'giraffe') {
        [-0.09, 0.09].forEach((hx) => {
          const horn = makeTaperedCylinderMesh(0.035, 0.035, 0.18, mAcc1, 10);
          horn.position.set(hx, 0.30, -0.02);
          headPivot.add(horn);
          const tip = makeEllipsoidMesh(0.055, 0.055, 0.055, mAcc1, 10);
          tip.position.set(hx, 0.40, -0.02);
          headPivot.add(tip);
        });
      }

      // 4本脚（2関節×4本）
      const legLenU = isTall ? 0.38 : 0.24;
      const legLenL = isTall ? 0.36 : 0.22;
      const legMat = speciesId === 'panda' ? mAcc1 : mMain;
      const footMat = (speciesId === 'giraffe' || speciesId === 'bear') ? mAcc1 : legMat;

      const legDefs = [
        { key: 'Leg_FL', x: -0.26, z: 0.32, sub: 'frontLimbs', exp: [-0.6, -0.4, 0.35], lbl: '前あし（2関節）' },
        { key: 'Leg_FR', x:  0.26, z: 0.32, sub: 'frontLimbs', exp: [ 0.6, -0.4, 0.35], lbl: null },
        { key: 'Leg_RL', x: -0.26, z: -0.34, sub: 'rearLimbs', exp: [-0.6, -0.4, -0.35], lbl: '後ろあし（2関節）' },
        { key: 'Leg_RR', x:  0.26, z: -0.34, sub: 'rearLimbs', exp: [ 0.6, -0.4, -0.35], lbl: null }
      ];
      legDefs.forEach((ld) => {
        const leg = buildTwoJointLeg(rig, ld.key, ld.x, -0.18, ld.z, legLenU, legLenL, 0.13, 0.11, 0.12, legMat, footMat, ld.sub, ld.exp);
        bodyPivot.add(leg.upperPivot);
        if (ld.lbl) rig.parts[`${ld.key}_Upper`].labelTitle = ld.lbl;
      });

      // しっぽ（トラ・ネコ・ライオン・柴犬は多関節しっぽ、ウサギ・パンダ・クマは丸しっぽピボット）
      if (['lion', 'tiger', 'dog', 'cat', 'giraffe'].includes(speciesId)) {
        const tailSegs = buildMultiJointChain(
          rig, 'Tail', 2, [0, 0.08, -0.54], [0.24, 0.24], [0.065, 0.055, 0.075], [0, 0, -1],
          mMain, speciesId === 'lion' || speciesId === 'giraffe' ? mAcc1 : mMain,
          'tailGimmick', [0, 0.25, -0.75]
        );
        tailSegs[0].rotation.x = speciesId === 'dog' ? 0.65 : 0.25;
        rig.parts['Tail_1'].baseRot.copy(tailSegs[0].rotation);
        rig.parts['Tail_1'].labelTitle = '多関節しっぽ';
        bodyPivot.add(tailSegs[0]);
      } else {
        const pomTail = new THREE.Group();
        pomTail.position.set(0, 0.02, -0.56);
        bodyPivot.add(pomTail);
        registerPart(rig, 'Tail_1', pomTail, 'tailGimmick', [0, 0.15, -0.65], 'ぷりぷり丸しっぽ');
        pomTail.add(makeEllipsoidMesh(0.14, 0.14, 0.14, speciesId === 'rabbit' ? mBelly : mMain, 14));
      }
    }

    // -------------------------------------------------------------------------
    // 3. 🐳 おおきなクジラさん / 🐋 シャチくん / 🦈 サメくん / 🐠 カクレクマノミ
    // -------------------------------------------------------------------------
    else if (['whale', 'orca', 'shark', 'clownfish'].includes(speciesId)) {
      const palettes = {
        whale:     { main: 0x2563eb, belly: 0xe0f2fe, acc: 0x93c5fd, iris: 0x1e3a8a },
        orca:      { main: 0x0f172a, belly: 0xf8fafc, acc: 0xffffff, iris: 0x1d4ed8 },
        shark:     { main: 0x475569, belly: 0xf1f5f9, acc: 0x1e293b, iris: 0x0f172a },
        clownfish: { main: 0xf97316, belly: 0xffffff, acc: 0x18181b, iris: 0x1e3a8a }
      };
      const pal = palettes[speciesId];
      const mMain = makeMat(pal.main, 0.32);
      const mBelly = makeMat(pal.belly, 0.38);
      const mAcc = makeMat(pal.acc, 0.35);

      const rx = speciesId === 'clownfish' ? 0.30 : (speciesId === 'whale' ? 0.58 : 0.44);
      const ry = speciesId === 'whale' ? 0.48 : 0.40;
      const rz = speciesId === 'whale' ? 0.72 : 0.66;

      bodyPivot.add(makeEllipsoidMesh(rx, ry, rz, mMain, 24));
      const underBelly = makeEllipsoidMesh(rx * 0.84, ry * 0.65, rz * 0.85, mBelly, 20);
      underBelly.position.set(0, -ry * 0.32, 0.05);
      bodyPivot.add(underBelly);

      // カクレクマノミの白バンド / シャチの白アイパッチ
      if (speciesId === 'clownfish') {
        [-0.22, 0.18].forEach((bz) => {
          const band = makeEllipsoidMesh(rx * 1.03, ry * 1.02, 0.11, mBelly, 18);
          band.position.z = bz;
          bodyPivot.add(band);
        });
      } else if (speciesId === 'orca') {
        [-1, 1].forEach((s) => {
          const patch = makeEllipsoidMesh(0.08, 0.12, 0.22, mBelly, 12);
          patch.position.set(s * 0.36, 0.14, 0.34);
          bodyPivot.add(patch);
        });
      }

      // 頭部＆開閉する下アゴ
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.04, 0.38);
      bodyPivot.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.35, 0.65], '頭部＆開閉アゴ');

      headPivot.add(createCuteEyePair(rx * 0.78, 0.06, 0.18, 0.078, pal.iris, 32));

      const jawPivot = new THREE.Group();
      jawPivot.position.set(0, -ry * 0.38, -0.05);
      headPivot.add(jawPivot);
      registerPart(rig, 'Jaw', jawPivot, 'head', [0, -0.45, 0.45], '開閉する下アゴ');
      const jawMesh = makeEllipsoidMesh(rx * 0.68, ry * 0.22, 0.38, mBelly, 16);
      jawMesh.position.z = 0.16;
      jawPivot.add(jawMesh);

      // クジラの潮吹きパーツ / サメ・シャチ・クマノミの背びれ
      if (speciesId === 'whale') {
        const spoutPivot = new THREE.Group();
        spoutPivot.position.set(0, ry * 0.92, 0.18);
        bodyPivot.add(spoutPivot);
        registerPart(rig, 'Spout', spoutPivot, 'head', [0, 0.75, 0], '潮吹きスプラッシュ');
        [-0.12, 0.12].forEach((sx) => {
          const sp = makeTaperedCylinderMesh(0.09, 0.03, 0.32, mAcc, 12);
          sp.position.set(sx, 0.16, 0);
          sp.rotation.z = sx > 0 ? -0.35 : 0.35;
          spoutPivot.add(sp);
        });
      } else {
        const dorsalPivot = new THREE.Group();
        dorsalPivot.position.set(0, ry * 0.88, -0.06);
        bodyPivot.add(dorsalPivot);
        registerPart(rig, 'DorsalFin', dorsalPivot, 'body', [0, 0.65, -0.1], '可動背びれ');
        const dFin = makeEllipsoidMesh(0.06, speciesId === 'clownfish' ? 0.22 : 0.38, 0.22, mMain, 14);
        dFin.position.y = 0.16;
        dFin.rotation.x = -0.28;
        dorsalPivot.add(dFin);
      }

      // 左右の胸びれ（Pectoral Flippers）
      [-1, 1].forEach((side) => {
        const key = side < 0 ? 'Flipper_L' : 'Flipper_R';
        const flipPivot = new THREE.Group();
        flipPivot.position.set(side * rx * 0.88, -0.10, 0.14);
        bodyPivot.add(flipPivot);
        registerPart(rig, key, flipPivot, 'frontLimbs', [side * 0.75, -0.25, 0.2], side < 0 ? '可動胸びれ' : null);

        const finMesh = makeEllipsoidMesh(0.32, 0.06, 0.18, mMain, 14);
        finMesh.position.x = side * 0.22;
        finMesh.rotation.z = side * -0.25;
        flipPivot.add(finMesh);
      });

      // 2段関節の尾胴＆尾びれ（Tail_1 -> Tail_2）
      const tailSegs = buildMultiJointChain(
        rig, 'Tail', 2, [0, 0, -rz * 0.82], [0.38, 0.32], [rx * 0.58, rx * 0.32, 0.08], [0, 0, -1], mMain, mMain, 'tailGimmick', [0, 0, -0.85]
      );
      bodyPivot.add(tailSegs[0]);
      rig.parts['Tail_1'].labelTitle = '2段関節の尾胴＆尾びれ';

      // 尾びれブレード（クジラ・シャチは水平2枚羽、サメ・クマノミは垂直尾びれ）
      const flukeHolder = tailSegs[1];
      if (speciesId === 'whale' || speciesId === 'orca') {
        [-1, 1].forEach((s) => {
          const fluke = makeEllipsoidMesh(0.36, 0.05, 0.18, mMain, 14);
          fluke.position.set(s * 0.26, 0, -0.32);
          fluke.rotation.y = s * -0.35;
          flukeHolder.add(fluke);
        });
      } else {
        const vFin = makeEllipsoidMesh(0.05, 0.38, 0.22, mMain, 14);
        vFin.position.set(0, 0.04, -0.32);
        flukeHolder.add(vFin);
      }
    }

    // -------------------------------------------------------------------------
    // 4. 🐢 ゆったりウミガメ / 🦭 ゴマフアザラシ / 🐟 マンタエイ
    // -------------------------------------------------------------------------
    else if (['turtle', 'seal', 'manta'].includes(speciesId)) {
      const palettes = {
        turtle: { main: 0x166534, belly: 0xfef08a, limb: 0x4ade80, iris: 0x064e3b },
        seal:   { main: 0xcbd5e1, belly: 0xf8fafc, limb: 0x94a3b8, iris: 0x0f172a },
        manta:  { main: 0x1e3a8a, belly: 0xf0f9ff, limb: 0x2563eb, iris: 0x0284c7 }
      };
      const pal = palettes[speciesId];
      const mMain = makeMat(pal.main, 0.38);
      const mBelly = makeMat(pal.belly, 0.42);
      const mLimb = makeMat(pal.limb, 0.40);

      // 甲羅または胴体
      const rx = speciesId === 'manta' ? 0.56 : 0.56;
      const ry = speciesId === 'manta' ? 0.18 : 0.32;
      const rz = 0.64;
      bodyPivot.add(makeEllipsoidMesh(rx, ry, rz, mMain, 22));
      const belly = makeEllipsoidMesh(rx * 0.88, ry * 0.55, rz * 0.88, mBelly, 18);
      belly.position.y = -ry * 0.45;
      bodyPivot.add(belly);

      // 頭部ピボット（ウミガメとアザラシは首が伸び縮み＆首振り）
      const headPivot = new THREE.Group();
      headPivot.position.set(0, speciesId === 'seal' ? 0.22 : 0.04, 0.58);
      bodyPivot.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.35, 0.70], '伸縮・首振り頭部');

      if (speciesId === 'manta') {
        // マンタの左右頭びれ（ホーン）
        [-1, 1].forEach((s) => {
          const horn = makeEllipsoidMesh(0.08, 0.06, 0.24, mLimb, 12);
          horn.position.set(s * 0.28, 0, 0.14);
          headPivot.add(horn);
        });
        headPivot.add(createCuteEyePair(0.36, 0.04, 0.05, 0.07, pal.iris, 25));
      } else {
        const hR = speciesId === 'seal' ? 0.32 : 0.22;
        headPivot.add(makeEllipsoidMesh(hR, hR * 0.88, hR * 1.05, mLimb, 18));
        headPivot.add(createCuteEyePair(hR * 0.62, 0.06, hR * 0.72, 0.07, pal.iris, 22));
      }

      // 左右の前ヒレ／マンタの2段関節巨大翼
      [-1, 1].forEach((side) => {
        const key = side < 0 ? 'Flipper_L' : 'Flipper_R';
        if (speciesId === 'manta') {
          const wingChain = buildMultiJointChain(
            rig, key, 2, [side * 0.42, 0, 0.05], [0.46, 0.42], [0.22, 0.14, 0.04], [side, 0, 0], mLimb, mMain, 'frontLimbs', [side * 0.8, 0.2, 0]
          );
          wingChain[0].scale.z = 2.2;
          bodyPivot.add(wingChain[0]);
          if (side < 0) rig.parts[`${key}_1`].labelTitle = '2段関節の巨大ヒレ（翼）';
        } else {
          const fPivot = new THREE.Group();
          fPivot.position.set(side * 0.48, -0.08, 0.26);
          bodyPivot.add(fPivot);
          registerPart(rig, key, fPivot, 'frontLimbs', [side * 0.7, -0.2, 0.3], side < 0 ? '可動前ヒレ' : null);
          const fMesh = makeEllipsoidMesh(0.36, 0.055, 0.16, mLimb, 14);
          fMesh.position.x = side * 0.24;
          fPivot.add(fMesh);
        }

        // 後ろヒレ
        const rKey = side < 0 ? 'RearFlipper_L' : 'RearFlipper_R';
        const rPivot = new THREE.Group();
        rPivot.position.set(side * 0.32, -0.10, -0.52);
        bodyPivot.add(rPivot);
        registerPart(rig, rKey, rPivot, 'rearLimbs', [side * 0.5, -0.2, -0.55], side < 0 ? '可動後ろヒレ' : null);
        const rMesh = makeEllipsoidMesh(0.20, 0.05, 0.16, mLimb, 12);
        rMesh.position.set(side * 0.12, 0, -0.10);
        rPivot.add(rMesh);
      });

      // しっぽ
      const tailPivot = new THREE.Group();
      tailPivot.position.set(0, -0.04, -0.60);
      bodyPivot.add(tailPivot);
      registerPart(rig, 'Tail_1', tailPivot, 'tailGimmick', [0, 0, -0.75], 'しっぽ');
      const tailLen = speciesId === 'manta' ? 0.75 : 0.22;
      const tCyl = makeTaperedCylinderMesh(0.05, 0.015, tailLen, mMain, 10);
      tCyl.rotation.x = -Math.PI / 2;
      tCyl.position.z = -tailLen * 0.5;
      tailPivot.add(tCyl);
    }

    // -------------------------------------------------------------------------
    // 5. 🐙 ぷりぷりタコさん / 🦑 スイスイいかさん（8本〜10本の2関節触腕が独立稼働！）
    // -------------------------------------------------------------------------
    else if (speciesId === 'octopus' || speciesId === 'squid') {
      const isOcto = speciesId === 'octopus';
      const mMain = makeMat(isOcto ? 0xef4444 : 0xec4899, 0.32);
      const mLight = makeMat(isOcto ? 0xfca5a5 : 0xfbcfe8, 0.38);

      // 頭（外套膜）ピボット
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.22, 0);
      bodyPivot.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.65, 0], isOcto ? '呼吸伸縮する丸い頭' : '三角エンペラ付き胴体');

      if (isOcto) {
        headPivot.add(makeEllipsoidMesh(0.48, 0.52, 0.48, mMain, 22));
        // ひょっとこ口（漏斗）
        const siphon = makeTaperedCylinderMesh(0.12, 0.09, 0.20, mMain, 14);
        siphon.rotation.x = Math.PI / 2;
        siphon.position.set(0, -0.14, 0.48);
        headPivot.add(siphon);
      } else {
        headPivot.add(makeEllipsoidMesh(0.36, 0.58, 0.36, mMain, 20));
        // イカの左右パタパタ動く三角エンペラ（耳ひれ）
        [-1, 1].forEach((s) => {
          const finPivot = new THREE.Group();
          finPivot.position.set(s * 0.24, 0.34, 0);
          headPivot.add(finPivot);
          registerPart(rig, s < 0 ? 'Flipper_L' : 'Flipper_R', finPivot, 'head', [s * 0.55, 0.45, 0], s < 0 ? '可動エンペラ（耳ひれ）' : null);
          const fin = makeEllipsoidMesh(0.28, 0.22, 0.05, mLight, 14);
          fin.position.x = s * 0.16;
          finPivot.add(fin);
        });
      }

      headPivot.add(createCuteEyePair(0.24, -0.06, 0.38, 0.085, 0x7f1d1d, 20));

      // 放射状に配置された8本の2段関節触腕（Tentacle_1 〜 Tentacle_8）
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + 0.39;
        const sx = Math.sin(angle);
        const sz = Math.cos(angle);
        const rBase = isOcto ? 0.32 : 0.22;

        const tSegs = buildMultiJointChain(
          rig,
          `Tentacle${i + 1}`,
          2,
          [sx * rBase, -0.22, sz * rBase],
          [0.34, 0.32],
          [0.11, 0.08, 0.04],
          [sx, -0.35, sz],
          mMain,
          mLight,
          i < 4 ? 'frontLimbs' : 'rearLimbs',
          [sx * 0.65, -0.35, sz * 0.65]
        );
        bodyPivot.add(tSegs[0]);
        if (i === 0) rig.parts['Tentacle1_1'].labelTitle = '2段関節×8本の独立可動触腕';
      }
    }

    // -------------------------------------------------------------------------
    // 6. 🦀 チョキチョキカニさん（可動ツメ付き大ハサミ2本＋2関節×6本歩脚＋飛び出る目柄）
    // -------------------------------------------------------------------------
    else if (speciesId === 'crab') {
      const mMain = makeMat(0xef4444, 0.35);
      const mOrange = makeMat(0xf97316, 0.38);
      const mBelly = makeMat(0xfed7aa, 0.45);

      bodyPivot.position.y = 0.56;
      bodyPivot.add(makeEllipsoidMesh(0.62, 0.30, 0.44, mMain, 22));

      // 飛び出る左右の目柄ピボット
      const headPivot = new THREE.Group();
      headPivot.position.set(0, 0.24, 0.28);
      bodyPivot.add(headPivot);
      registerPart(rig, 'Head', headPivot, 'head', [0, 0.55, 0.35], '飛び出る可動目柄');

      [-0.22, 0.22].forEach((ex) => {
        const stalk = makeTaperedCylinderMesh(0.04, 0.045, 0.22, mBelly, 10);
        stalk.position.set(ex, 0.08, 0);
        headPivot.add(stalk);
      });
      headPivot.add(createCuteEyePair(0.22, 0.22, 0.04, 0.08, 0x0f172a, 8));

      // 左右の大きなハサミ（腕ピボット＋開閉する可動ツメピボット）
      [-1, 1].forEach((side) => {
        const armKey = side < 0 ? 'ClawArm_L' : 'ClawArm_R';
        const pincerKey = side < 0 ? 'Pincer_L' : 'Pincer_R';

        const armPivot = new THREE.Group();
        armPivot.position.set(side * 0.48, 0.08, 0.26);
        bodyPivot.add(armPivot);
        registerPart(rig, armKey, armPivot, 'frontLimbs', [side * 0.65, 0.35, 0.55], side < 0 ? '可動大ハサミ＆開閉ツメ' : null);

        const armMesh = makeTaperedCylinderMesh(0.08, 0.09, 0.36, mOrange, 12);
        armMesh.position.set(side * 0.14, 0.14, 0.14);
        armMesh.rotation.z = side * -0.55;
        armMesh.rotation.x = 0.45;
        armPivot.add(armMesh);

        // ハサミ本体
        const palm = makeEllipsoidMesh(0.16, 0.22, 0.13, mMain, 14);
        palm.position.set(side * 0.26, 0.32, 0.28);
        armPivot.add(palm);

        // チョキチョキ動く内側のツメ
        const pincerPivot = new THREE.Group();
        pincerPivot.position.set(side * 0.16, 0.32, 0.30);
        armPivot.add(pincerPivot);
        registerPart(rig, pincerKey, pincerPivot, 'frontLimbs', [0, 0.2, 0.2]);
        const pincerMesh = makeEllipsoidMesh(0.08, 0.18, 0.09, mOrange, 12);
        pincerMesh.position.y = 0.10;
        pincerPivot.add(pincerMesh);
      });

      // 左右3対（計6本）の2関節横歩き脚
      [0.14, -0.04, -0.22].forEach((lz, zIdx) => {
        [-1, 1].forEach((side) => {
          const k = `CrabLeg_${side < 0 ? 'L' : 'R'}${zIdx + 1}`;
          const leg = buildTwoJointLeg(
            rig, k, side * 0.52, -0.06, lz, 0.24, 0.24, 0.065, 0.055, 0.045,
            mOrange, mMain, zIdx === 0 ? 'frontLimbs' : 'rearLimbs', [side * 0.65, -0.35, lz]
          );
          leg.upperPivot.rotation.z = side * 0.62;
          leg.lowerPivot.rotation.z = side * -0.78;
          rig.parts[`${k}_Upper`].baseRot.copy(leg.upperPivot.rotation);
          rig.parts[`${k}_Lower`].baseRot.copy(leg.lowerPivot.rotation);
          bodyPivot.add(leg.upperPivot);
          if (zIdx === 0 && side < 0) rig.parts[`${k}_Upper`].labelTitle = '横歩き6本脚（各2関節）';
        });
      });
    }

    // どのゲームに配置しても自動で関節アニメーションが動くフック（autoAnimate = true の場合）
    const autoDriverMesh = bodyPivot.children.find((c) => c.isMesh);
    if (autoDriverMesh) {
      let lastFrameTime = -1;
      autoDriverMesh.onBeforeRender = function () {
        if (!rig.autoAnimate) return;
        const now = performance.now() * 0.001;
        if (Math.abs(now - lastFrameTime) < 0.005) return;
        lastFrameTime = now;
        const st = computeState(speciesId, {
          speed: rig.autoParams.speed,
          gimmick: rig.autoParams.gimmick,
          turnDeg: rig.autoParams.turnDeg,
          lively: rig.autoParams.lively,
          explodeProgress: rig.autoParams.explodeProgress,
          time: now,
          phase: now * 4.5
        });
        applyState(rig, st);
      };
    }

    return rig;
  }

  // ===========================================================================
  // 4. 絶対原則：単一数理モデル純粋関数 computeState(speciesId, input)
  //    入力パラメータからすべての関節角度・伸縮・分解オフセット・計器波形を一括計算
  // ===========================================================================
  function computeState(speciesId, input) {
    const speed = Math.max(0, Math.min(120, input.speed !== undefined ? input.speed : 60));          // 0 ~ 120 (%)
    const gimmick = Math.max(0, Math.min(100, input.gimmick !== undefined ? input.gimmick : 50));    // 0 ~ 100 (%)
    const turnDeg = Math.max(-35, Math.min(35, input.turnDeg !== undefined ? input.turnDeg : 0));    // -35 ~ +35 (deg)
    const lively = Math.max(0, Math.min(100, input.lively !== undefined ? input.lively : 60));       // 0 ~ 100 (%)
    const explode = Math.max(0, Math.min(1, input.explodeProgress !== undefined ? input.explodeProgress : 0));
    const phase = input.phase !== undefined ? input.phase : (input.time || 0) * 4.5;
    const time = input.time || 0;

    const sNorm = speed / 100;
    const gNorm = gimmick / 100;
    const lNorm = lively / 100;
    const turnRad = turnDeg * DEG2RAD;

    // 4本脚の歩行位相（FL: 0, RR: π/2, FR: π, RL: 3π/2）
    const strideAmp = (0.12 + 0.52 * sNorm) * (0.6 + 0.4 * lNorm);
    const legPhases = [0, Math.PI, Math.PI * 1.5, Math.PI * 0.5]; // FL, FR, RL, RR
    const legs = legPhases.map((offset) => {
      const p = phase + offset;
      const hipSwing = Math.sin(p) * strideAmp;
      const kneeBend = Math.max(0, Math.cos(p)) * strideAmp * 1.15;
      return { hipSwing, kneeBend };
    });

    // 胴体のバウンス上下動・ピッチ・旋回ロール
    const bodyBounceY = Math.abs(Math.sin(phase)) * 0.08 * (sNorm + 0.3 * lNorm);
    const bodyPitch = Math.cos(phase) * 0.05 * sNorm;
    const bodyRoll = -turnRad * 0.25 + Math.sin(phase * 0.5) * 0.04 * lNorm;
    const bodyYaw = turnRad * 0.35;

    // 首・頭の旋回＆うなずき
    const headYaw = turnRad * 0.65 + Math.sin(time * 2.1) * 0.14 * lNorm;
    const headPitch = Math.sin(phase) * 0.09 * sNorm - gNorm * 0.18;
    const headRoll = -turnRad * 0.32 + Math.cos(time * 2.7) * 0.12 * lNorm;

    // 象の3段鼻カール＆左右スイング
    const trunkCurlBase = (gNorm * 0.65) + Math.sin(time * 2.8) * (0.18 + 0.25 * lNorm);
    const trunkSway = turnRad * 0.45 + Math.cos(time * 2.2) * (0.15 + 0.25 * gNorm);

    // 耳のパタパタ角度（ぞうさん・ウサギ・コアラ・イヌ等）
    const earFlap = (0.15 + 0.55 * gNorm + 0.25 * lNorm) * Math.sin(time * 6.5);

    // 下アゴの開閉角度（ライオン咆哮・クジラ・サメ・クマ）
    const jawOpen = Math.max(0, gNorm * 0.58 + Math.sin(time * 5.2) * 0.22 * gNorm);

    // しっぽ・尾びれの多関節スイング
    const tailSwing1 = Math.sin(phase * 1.2) * (0.25 + 0.45 * lNorm + 0.35 * sNorm);
    const tailSwing2 = Math.sin(phase * 1.2 - 0.85) * (0.35 + 0.55 * lNorm + 0.40 * sNorm);

    // 海の動物のヒレ羽ばたき角度
    const flipperFlap = Math.sin(phase) * (0.28 + 0.48 * sNorm + 0.25 * gNorm);
    const flipperTwist = Math.cos(phase) * 0.22 * sNorm;

    return {
      speed,
      gimmick,
      turnDeg,
      lively,
      explode,
      phase,
      time,
      legs,
      bodyBounceY,
      bodyPitch,
      bodyRoll,
      bodyYaw,
      headYaw,
      headPitch,
      headRoll,
      trunkCurlBase,
      trunkSway,
      earFlap,
      jawOpen,
      tailSwing1,
      tailSwing2,
      flipperFlap,
      flipperTwist
    };
  }

  // ===========================================================================
  // 5. computeState の出力値を3Dモデルの全関節ピボットへ反映する関数
  // ===========================================================================
  function applyState(rig, state, options = {}) {
    const e = state.explode;
    const subsystemFilter = options.subsystemFilter || 'all';
    const showJoints = !!options.showJoints;
    const wireframeBody = !!options.skeletonMode;

    // まず全パーツを基準位置＋分解オフセットにセットし、表示フィルタとスケルトン透視を適用
    rig.partList.forEach((p) => {
      p.group.position.set(
        p.basePos.x + p.explodeOffset.x * e,
        p.basePos.y + p.explodeOffset.y * e,
        p.basePos.z + p.explodeOffset.z * e
      );
      p.group.rotation.copy(p.baseRot);
      p.group.scale.copy(p.baseScale);

      const isVisible = subsystemFilter === 'all' || p.subsystem === subsystemFilter;
      p.group.visible = isVisible;
      if (p.jointMarker) {
        p.jointMarker.visible = showJoints && isVisible;
      }
    });

    // スケルトン半透明モード切替
    rig.root.traverse((obj) => {
      if (obj.isMesh && !obj.name.startsWith('joint_') && obj.material && obj.material.isMeshStandardMaterial) {
        obj.material.transparent = wireframeBody;
        obj.material.opacity = wireframeBody ? 0.42 : 1.0;
      }
    });

    const parts = rig.parts;

    // 1. 胴体バウンス・ロール・ピッチ・旋回
    if (parts['Body']) {
      parts['Body'].group.position.y += state.bodyBounceY;
      parts['Body'].group.rotation.x += state.bodyPitch;
      parts['Body'].group.rotation.y += state.bodyYaw;
      parts['Body'].group.rotation.z += state.bodyRoll;
    }

    // 2. 首・頭部（キリンの2段首を含む）
    if (parts['Neck_1']) {
      parts['Neck_1'].group.rotation.x += state.headPitch * 0.8 + (state.gimmick / 100) * 0.45;
      parts['Neck_1'].group.rotation.z += state.headRoll * 0.6;
    }
    if (parts['Neck_2']) {
      parts['Neck_2'].group.rotation.x += state.headPitch * 0.9 + (state.gimmick / 100) * 0.35;
      parts['Neck_2'].group.rotation.y += state.headYaw * 0.5;
    }
    if (parts['Head']) {
      parts['Head'].group.rotation.x += state.headPitch;
      parts['Head'].group.rotation.y += state.headYaw;
      parts['Head'].group.rotation.z += state.headRoll;

      // ウミガメ・アザラシの首伸縮ギミック
      if (rig.speciesId === 'turtle' || rig.speciesId === 'seal') {
        parts['Head'].group.position.z += (state.gimmick / 100) * 0.22;
      }
      // タコの頭伸縮
      if (rig.speciesId === 'octopus') {
        const pulse = 1 + Math.sin(state.phase) * 0.08 * (state.gimmick / 100 + 0.3);
        parts['Head'].group.scale.set(1 / Math.sqrt(pulse), pulse, 1 / Math.sqrt(pulse));
      }
    }

    // 3. ライオンのタテガミ振動・クジラの潮吹き伸縮
    if (parts['Mane']) {
      const mScale = 1 + Math.sin(state.time * 12) * 0.06 * (state.gimmick / 100);
      parts['Mane'].group.scale.set(mScale, mScale, 1);
    }
    if (parts['Spout']) {
      const sScale = 0.2 + (state.gimmick / 100) * 1.15 * (0.7 + 0.3 * Math.sin(state.time * 8));
      parts['Spout'].group.scale.set(sScale, sScale, sScale);
    }

    // 4. 開閉する下アゴ
    if (parts['Jaw']) {
      parts['Jaw'].group.rotation.x += state.jawOpen;
    }

    // 5. ぞうさんの3段関節の長い鼻（Trunk_1..3 または GLB Trunk）
    ['Trunk_1', 'Trunk_2', 'Trunk_3'].forEach((tk, idx) => {
      if (parts[tk]) {
        parts[tk].group.rotation.x -= state.trunkCurlBase * (0.55 + idx * 0.25);
        parts[tk].group.rotation.y += state.trunkSway * (0.4 + idx * 0.3);
      }
    });
    if (parts['Trunk']) {
      parts['Trunk'].group.rotation.x -= state.trunkCurlBase * 0.85;
      parts['Trunk'].group.rotation.y += state.trunkSway * 0.65;
    }

    // 6. 左右の耳（ぞうさんのパタパタ耳 / ウサギの2段折れ耳 / 各種動物の耳ピクピク）
    if (parts['Ear_L'] && parts['Ear_R']) {
      if (rig.speciesId === 'elephant') {
        parts['Ear_L'].group.rotation.y -= Math.abs(state.earFlap) * 0.95 + (state.gimmick / 100) * 0.45;
        parts['Ear_R'].group.rotation.y += Math.abs(state.earFlap) * 0.95 + (state.gimmick / 100) * 0.45;
      } else {
        parts['Ear_L'].group.rotation.z += state.earFlap * 0.55;
        parts['Ear_R'].group.rotation.z -= state.earFlap * 0.55;
      }
    }
    if (parts['Ear_L_1'] && parts['Ear_R_1']) {
      parts['Ear_L_1'].group.rotation.x += state.earFlap * 0.45;
      parts['Ear_R_1'].group.rotation.x -= state.earFlap * 0.45;
      parts['Ear_L_2'].group.rotation.x += (state.gimmick / 100) * 0.85 + Math.abs(state.earFlap) * 0.5;
      parts['Ear_R_2'].group.rotation.x += (state.gimmick / 100) * 0.85 - Math.abs(state.earFlap) * 0.5;
    }

    // 7. 4本脚（肩/股関節と膝の2関節連動ウォーキング）
    const legKeys = ['Leg_FL', 'Leg_FR', 'Leg_RL', 'Leg_RR'];
    legKeys.forEach((lk, idx) => {
      const u = parts[`${lk}_Upper`];
      const l = parts[`${lk}_Lower`];
      if (u && l) {
        u.group.rotation.x += state.legs[idx].hipSwing;
        l.group.rotation.x += state.legs[idx].kneeBend;
      } else if (parts[lk]) {
        // Multi-Node GLB 単関節・柱状脚
        parts[lk].group.rotation.x += state.legs[idx].hipSwing;
      }
    });

    // 8. 多関節しっぽ・尾びれ
    if (parts['Tail']) {
      if (['whale', 'orca', 'turtle', 'seal', 'manta'].includes(rig.speciesId)) {
        parts['Tail'].group.rotation.x += state.tailSwing1 * 0.65;
      } else {
        parts['Tail'].group.rotation.y += state.tailSwing1;
      }
    }
    if (parts['Fluke'] || parts['Fin_Caudal'] || parts['Flipper_Rear']) {
      const f = parts['Fluke'] || parts['Fin_Caudal'] || parts['Flipper_Rear'];
      f.group.rotation.x += state.tailSwing2 * 0.85;
    }
    if (parts['Tail_1']) {
      if (['whale', 'orca', 'turtle', 'seal', 'manta'].includes(rig.speciesId)) {
        parts['Tail_1'].group.rotation.x += state.tailSwing1 * 0.65;
        if (parts['Tail_2']) parts['Tail_2'].group.rotation.x += state.tailSwing2 * 0.85;
      } else {
        parts['Tail_1'].group.rotation.y += state.tailSwing1;
        if (parts['Tail_2']) parts['Tail_2'].group.rotation.y += state.tailSwing2;
      }
    }

    // 9. 海の動物の胸びれ・マンタの2段関節翼
    if (parts['Flipper_L'] && parts['Flipper_R']) {
      parts['Flipper_L'].group.rotation.z += state.flipperFlap;
      parts['Flipper_R'].group.rotation.z -= state.flipperFlap;
      parts['Flipper_L'].group.rotation.x += state.flipperTwist;
      parts['Flipper_R'].group.rotation.x += state.flipperTwist;
    }
    if (parts['Flipper_FL'] && parts['Flipper_FR']) {
      parts['Flipper_FL'].group.rotation.z += state.flipperFlap;
      parts['Flipper_FR'].group.rotation.z -= state.flipperFlap;
    }
    if (parts['Wing_L'] && parts['Wing_R']) {
      parts['Wing_L'].group.rotation.z += state.flipperFlap * 0.85;
      parts['Wing_R'].group.rotation.z -= state.flipperFlap * 0.85;
    }
    if (parts['Cephalic_L'] && parts['Cephalic_R']) {
      parts['Cephalic_L'].group.rotation.y += Math.sin(state.phase) * 0.35;
      parts['Cephalic_R'].group.rotation.y -= Math.sin(state.phase) * 0.35;
    }
    if (parts['Fin_Pectoral_L'] && parts['Fin_Pectoral_R']) {
      parts['Fin_Pectoral_L'].group.rotation.y += Math.sin(state.phase * 2) * 0.55;
      parts['Fin_Pectoral_R'].group.rotation.y -= Math.sin(state.phase * 2) * 0.55;
    }
    if (parts['Flipper_L_1'] && parts['Flipper_R_1']) {
      parts['Flipper_L_1'].group.rotation.z += state.flipperFlap * 0.75;
      parts['Flipper_R_1'].group.rotation.z -= state.flipperFlap * 0.75;
      parts['Flipper_L_2'].group.rotation.z += Math.sin(state.phase - 0.9) * 0.65;
      parts['Flipper_R_2'].group.rotation.z -= Math.sin(state.phase - 0.9) * 0.65;
    }
    if (parts['RearFlipper_L'] && parts['RearFlipper_R']) {
      parts['RearFlipper_L'].group.rotation.x += state.flipperFlap * 0.6;
      parts['RearFlipper_R'].group.rotation.x -= state.flipperFlap * 0.6;
    }

    // 10. タコ・イカの8本×2関節触腕ダンス
    for (let i = 1; i <= 8; i++) {
      if (parts[`Arm_${i}`]) {
        parts[`Arm_${i}`].group.rotation.x += Math.sin(state.phase + i * 0.78) * 0.35;
        parts[`Arm_${i}`].group.rotation.z += Math.cos(state.phase + i * 0.78) * 0.25;
      }
      const t1 = parts[`Tentacle${i}_1`];
      const t2 = parts[`Tentacle${i}_2`];
      if (t1 && t2) {
        const wave = Math.sin(state.phase + i * 0.78) * (0.28 + 0.45 * (state.gimmick / 100));
        t1.group.rotation.x += wave;
        t2.group.rotation.x += Math.cos(state.phase + i * 0.78) * 0.55;
      }
    }
    if (parts['Tentacle_L'] && parts['Tentacle_R']) {
      parts['Tentacle_L'].group.rotation.x += Math.sin(state.phase) * 0.25;
      parts['Tentacle_R'].group.rotation.x += Math.sin(state.phase + 0.5) * 0.25;
    }

    // 11. カニの両大ハサミバンザイ＆ツメ開閉＋6本脚横歩き
    if (parts['Claw_L'] && parts['Claw_R']) {
      const raise = (state.gimmick / 100) * 0.45;
      parts['Claw_L'].group.rotation.x -= raise;
      parts['Claw_R'].group.rotation.x -= raise;
      for (let s of ['L', 'R']) {
        for (let l = 1; l <= 3; l++) {
          if (parts[`Leg_${s}${l}`]) {
            const w = Math.sin(state.phase + l * 1.1 + (s === 'R' ? Math.PI : 0)) * 0.35;
            parts[`Leg_${s}${l}`].group.rotation.z += (s === 'L' ? w : -w);
          }
        }
      }
    }
    if (parts['ClawArm_L'] && parts['ClawArm_R']) {
      const raise = (state.gimmick / 100) * 0.55;
      parts['ClawArm_L'].group.rotation.x -= raise;
      parts['ClawArm_R'].group.rotation.x -= raise;
      const pinch = Math.abs(Math.sin(state.time * 6)) * (0.25 + 0.45 * (state.gimmick / 100));
      if (parts['Pincer_L']) parts['Pincer_L'].group.rotation.z -= pinch;
      if (parts['Pincer_R']) parts['Pincer_R'].group.rotation.z += pinch;

      for (let zIdx = 1; zIdx <= 3; zIdx++) {
        ['L', 'R'].forEach((s, sIdx) => {
          const cu = parts[`CrabLeg_${s}${zIdx}_Upper`];
          const cl = parts[`CrabLeg_${s}${zIdx}_Lower`];
          if (cu && cl) {
            const w = Math.sin(state.phase + zIdx * 1.1 + sIdx * Math.PI) * 0.35 * (state.speed / 100 + 0.2);
            cu.group.rotation.z += w;
            cl.group.rotation.z -= w * 1.2;
          }
        });
      }
    }
  }

  global.ArticulatedAnimalFactory = {
    SPECIES_CATALOG,
    create: createAnimalRig,
    computeState,
    applyState
  };
})(window);
