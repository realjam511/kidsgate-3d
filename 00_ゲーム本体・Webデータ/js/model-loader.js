/**
 * KidsGate 3D Model Loader Helper
 * Three.js + GLTFLoader 自動サイズ正規化＆オフライン/file://完全対応モジュール
 */

class ModelLoader {
    constructor() {
        this.cache = new Map();
        this.loader = null;
    }

    getLoader() {
        if (!this.loader && typeof THREE !== 'undefined' && THREE.GLTFLoader) {
            const manager = new THREE.LoadingManager();
            manager.setURLModifier((url) => {
                if ((url.includes('colormap.png') || url.endsWith('colormap.png')) && window.KENNEY_COLORMAP_DATA_URI) {
                    return window.KENNEY_COLORMAP_DATA_URI;
                }
                return url;
            });
            this.loader = new THREE.GLTFLoader(manager);
        }
        return this.loader;
    }

    /**
     * Base64文字列をArrayBufferに変換
     */
    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * GLTF/GLBモデルを読み込み、キャッシュして返す
     * file://環境でのCORS制限を自動回避するため、Base64データ（window.MODELS_BASE64_DATA）を最優先で利用
     * @param {string} urlOrId - .glbのパスまたはモデルID（例: 'truck-yellow' または 'assets/models/vehicles/truck-yellow.glb'）
     * @param {number} targetSize - バウンディングボックスの目標サイズ (デフォルト: 1.5)
     * @returns {Promise<THREE.Group>}
     */
    async load(urlOrId, targetSize = 1.5) {
        const loader = this.getLoader();
        if (!loader) {
            throw new Error("THREE.GLTFLoader が読み込まれていません。<script src='.../GLTFLoader.js'></script> を確認してください。");
        }

        // キャッシュチェック
        if (this.cache.has(urlOrId)) {
            const cachedGltf = this.cache.get(urlOrId);
            return this.cloneAndNormalize(cachedGltf.scene, targetSize);
        }

        // モデルIDの抽出 (例: 'assets/models/vehicles/truck-yellow.glb' -> 'truck-yellow')
        let modelId = urlOrId;
        if (urlOrId.includes('/') || urlOrId.includes('\\')) {
            const parts = urlOrId.split(/[/\\]/);
            const filename = parts[parts.length - 1];
            modelId = filename.replace(/\.(glb|gltf)$/i, '');
        }

        // 0. 可動式マルチパーツ動物モデル (ArticulatedAnimalFactory) が対応している種別なら優先生成
        if (window.ArticulatedAnimalFactory) {
            const isArticulated = window.ArticulatedAnimalFactory.SPECIES_CATALOG.some(s => s.id === modelId);
            if (isArticulated) {
                const rig = window.ArticulatedAnimalFactory.create(modelId);
                rig.autoAnimate = true;
                const box = new THREE.Box3().setFromObject(rig.root);
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0.0001) {
                    const scale = targetSize / maxDim;
                    rig.root.scale.set(scale, scale, scale);
                }
                return rig.root;
            }
        }

        // 1. オフライン/ローカル(file://)対応：Base64データがあれば即座にparse（CORS制限ゼロ！）
        let b64 = null;
        if (window.MODELS_BASE64_DATA) {
            b64 = window.MODELS_BASE64_DATA[modelId] ||
                  window.MODELS_BASE64_DATA[modelId.replace(/\+/g, ' ')] ||
                  window.MODELS_BASE64_DATA[modelId.replace(/ /g, '+')] ||
                  window.MODELS_BASE64_DATA[modelId.toLowerCase()];
        }

        if (b64) {
            try {
                const buffer = this.base64ToArrayBuffer(b64);
                return new Promise((resolve, reject) => {
                    loader.parse(buffer, '', (gltf) => {
                        this.cache.set(urlOrId, gltf);
                        this.cache.set(modelId, gltf);
                        resolve(this.cloneAndNormalize(gltf.scene, targetSize));
                    }, reject);
                });
            } catch (err) {
                console.warn(`[ModelLoader] Base64デコード失敗 (${modelId}):`, err);
            }
        }

        // 2. HTTP/HTTPSまたはBase64未登録モデル：標準のFetch/FileLoader
        return new Promise((resolve, reject) => {
            loader.load(
                urlOrId,
                (gltf) => {
                    this.cache.set(urlOrId, gltf);
                    this.cache.set(modelId, gltf);
                    resolve(this.cloneAndNormalize(gltf.scene, targetSize));
                },
                undefined,
                (error) => {
                    console.warn(`[ModelLoader] モデル読み込み失敗 (${urlOrId}):`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * モデルをクローンし、中心合わせ＆サイズ自動正規化を行う
     */
    cloneAndNormalize(scene, targetSize = 1.5) {
        const clone = scene.clone(true);

        // シャドウとマテリアル調整（ガラス・透明パーツの自動透過最適化）
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach((mat) => {
                        const name = (mat.name || '').toLowerCase();
                        // 自動車のガラス素材、またはKHR_materials_transmission素材が白塗り不透明になるのを防止
                        if (mat.transmission > 0 || name.includes('glass') || name.includes('window') || name.includes('windshield')) {
                            mat.transparent = true;
                            mat.roughness = 0.05;
                            mat.metalness = 0.1;
                            mat.depthWrite = false; // 透明パーツの前後関係を綺麗に透過
                            mat.transmission = 0;   // Three.jsで環境マップ未設定時に白濁化するtransmissionの代わりに高品位Alpha Blend

                            if (name.includes('dark')) {
                                mat.color.setHex(0x0f172a);
                                mat.opacity = 0.45; // スモークガラス
                            } else if (name.includes('red')) {
                                mat.color.setHex(0xdc2626);
                                mat.opacity = 0.55; // テールランプのクリアレッド
                            } else {
                                // フロントガラス・サイドガラス：透明感のある高級スモーククリアガラス
                                mat.color.setHex(0x1e293b);
                                mat.opacity = 0.28;
                            }
                        }
                        mat.needsUpdate = true;
                    });
                }
            }
        });

        // バウンディングボックスの計算
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);

        // 最大軸に合わせてスケール比率を計算
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = targetSize / maxDim;
            clone.scale.set(scale, scale, scale);
        }

        // 底面中央を原点 (y=0) に揃える
        const scaledBox = new THREE.Box3().setFromObject(clone);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);
        clone.position.x -= scaledCenter.x;
        clone.position.z -= scaledCenter.z;
        clone.position.y -= scaledBox.min.y; // 底面をy=0に接地

        const wrapper = new THREE.Group();
        wrapper.add(clone);
        return wrapper;
    }
}

// グローバル公開
window.KidsGateModelLoader = new ModelLoader();
