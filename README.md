# React Testing Library practise

## create-react-app

```zsh
npx create-react-app . --template redux
```

## Step1. Rendering テスト

各 HTML 要素が存在するかどうかをテストする

### Import

```js
import React from "react";
import { render, screen } from "@testing-library/react";
import Render from "./Render";
```

### 実行方法

```zsh
yarn test
```

### 記述形式

```js
describe("テストの名前", () => {
  it("テストケースの内容", () => {
    render(<コンポーネント />); // render コマンドを使って、コンポーネントの内容を取得する
    // screen.debug(); // 取得したコンポーネント全体の要素を取得する
    // screen.debug(取得したい要素の指定);
    expect(screen.getByRole("heading")).toBeTruthy(); // ecpect() のカッコ内の要素が存在するかどうか(ToBeTruthy)の判定テスト
    expect(screen.queryByText("Udeeeeemy")).toBeNull();
    // null 要素に対してget~を使用すると、toBe~まで走らずエラー判定になってしまうため、この場合はquery~を使用する
  });
});
```

- 各 HTML タグは、Role というカテゴリーに分類されている。タグがどの Role に分類されているかはこちらを参照する。
  - https://github.com/A11yance/aria-query#elements-to-roles
- Jest に標準で定義されているマッチャについては以下を参照する。
  - https://jestjs.io/docs/en/expect
- Testing-Library 独自の拡張マッチャについては以下を参照する。
  - https://github.com/testing-library/jest-dom#custom-matchers

### 追加の設定

標準では、テスト結果を表示するコンソールにテスト名が含まれないため、含まれて表示されるように変更する。  
変更後は、`yarn test` を再起動する。

```json
  "scripts": {
    ...
-   "test": "react-scripts test",
+   "test": "react-scripts test --env=jsdom --verbose",
    ...
  },
```

## Step2. UserEvent テスト

ユーザーが起こすイベントを再現するテストを書く
