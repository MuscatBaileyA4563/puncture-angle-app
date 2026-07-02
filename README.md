# 穿刺針 刺入角 自動測定アプリ

スマートフォン等のカメラ映像から、穿刺針の刺入角度・到達距離をリアルタイムに自動測定するWebアプリ（PWA）です。医療従事者の手技トレーニング・教育補助を目的としています。

## ⚠️ 免責事項

本アプリが表示する角度・到達距離は、カメラ画像からの自動推定による**参考値**です。照明条件や体位、皮膚の状態によって誤検出・誤差が生じることがあります。

実際の穿刺角度・深さの判断は、必ず手技を行う医療従事者自身の**臨床判断**に基づいて行ってください。本アプリの表示のみを根拠に手技を行わないでください。

## 主な機能

- カメラ映像からの針の自動検出・刺入角度のリアルタイム表示
- 深さ設定に応じた適正角度の判定（浅い/適正/深い）
- 皮膚基準線・検出ROIの手動調整（ドラッグ操作）
- オフライン対応（PWA、Service Workerによる事前キャッシュ）
- フレームバッファによる録画・レビュー機能

### 検出アルゴリズム

以下の2段階のハイブリッド構成です。

1. **YOLO11n（ONNX / onnxruntime-web）** ― 画面内で「針がだいたいどこにあるか」の大まかな矩形(ROI)を検出し、背景（ベッド柵・シワ等）を誤検出から除外する
2. **OpenCV.js（Canny / HoughLinesP）** ― YOLOが絞り込んだ領域内で直線をフィットし、正確な始点・終点から角度を計算する

YOLOモデルが読み込めない、あるいは推論に失敗した場合は、自動的にOpenCV.js単体の検出にフォールバックします。

## ファイル構成

以下のファイルを **すべて同じディレクトリ** に配置してください（相対パス参照のため）。

```
.
├── index.html
├── sw.js
├── manifest.webmanifest
├── icon-192.png
├── icon-512.png
├── opencv.js                      # OpenCV.js (Apache-2.0)
├── best.onnx                      # 針検出モデル (YOLO11n / 自前学習)
├── ort.wasm.min.js                # onnxruntime-web (MIT)
└── ort-wasm-simd-threaded.mjs/.wasm
```

## セットアップ

静的ファイルをそのまま配信できる任意のHTTPサーバーで公開してください。カメラ(`getUserMedia`)を使うため、**HTTPS環境**（もしくは`localhost`）が必要です。

```bash
# ローカル確認用の一例
npx serve .
# もしくは
python3 -m http.server 8000
```

初回アクセス時に全アセット（合計約35MB）がService Workerに事前キャッシュされます。2回目以降はオフラインでも起動します。

## 技術構成

| 用途 | ライブラリ |
|---|---|
| 画像処理・幾何計算 | [OpenCV.js](https://opencv.org/) |
| 針検出モデルの推論 | [onnxruntime-web](https://github.com/microsoft/onnxruntime) |
| モデル学習 | [Ultralytics YOLO11n](https://github.com/ultralytics/ultralytics) |

## ライセンスに関する注意

このリポジトリは以下の第三者コンポーネントを含みます。再配布・改変の際はそれぞれのライセンスに従ってください。

- **OpenCV.js** — Apache License 2.0
- **onnxruntime-web** — MIT License
- **`best.onnx`（同梱モデル）** — [Ultralytics YOLO11](https://github.com/ultralytics/ultralytics)を用いて学習。UltralyticsのYOLOモデル・学習コードは **AGPL-3.0** で提供されており、学習済みモデルを含む本アプリを公開・配布する場合、AGPL-3.0の条件（ソースコード全体の同ライセンスでの公開等）が適用される可能性があります。商用利用やAGPL-3.0を避けたい場合は、[Ultralytics Enterprise License](https://www.ultralytics.com/license)の取得を検討してください。本READMEはライセンスの法的助言ではないため、正式な判断は原文および必要に応じて専門家にご確認ください。

本アプリ自体のライセンスは別途 `LICENSE` ファイルを追加の上、明記してください。
