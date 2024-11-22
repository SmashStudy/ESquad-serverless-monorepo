import React from "react";
import { render } from "@testing-library/react";
import GalleryLayout from "../../../src/components/icons/GalleryLayout";
import "@testing-library/jest-dom";

describe("GalleryLayout 컴포넌트", () => {
  test("기본 렌더링 확인", () => {
    const { container } = render(<GalleryLayout />);

    // SVG 요소가 렌더링 되었는지 확인
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  test("SVG path가 제대로 렌더링되는지 확인", () => {
    const { container } = render(<GalleryLayout />);

    // 정확한 path 요소가 렌더링되었는지 확인
    const pathElement = container.querySelector("svg g path");
    expect(pathElement).toBeInTheDocument();
  });
});
