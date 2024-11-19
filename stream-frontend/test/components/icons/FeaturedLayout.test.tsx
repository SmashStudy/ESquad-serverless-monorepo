import React from "react";
import { render } from "@testing-library/react";
import FeaturedLayout from "../../../src/components/icons/FeaturedLayout";
import "@testing-library/jest-dom";

describe("FeaturedLayout 컴포넌트", () => {
  test("기본 렌더링 확인", () => {
    const { container } = render(<FeaturedLayout />);

    // SVG 요소가 렌더링되었는지 확인
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  test("SVG 아이콘의 클래스와 속성 확인", () => {
    const { container } = render(<FeaturedLayout />);

    // svg 태그의 클래스와 속성이 올바르게 설정되어 있는지 확인
    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
    expect(svgElement).toHaveAttribute("width", "24");
    expect(svgElement).toHaveAttribute("height", "24");
    expect(svgElement).toHaveAttribute("viewBox", "0 0 24 24");
  });

  test("내부 path 요소가 렌더링되는지 확인", () => {
    const { container } = render(<FeaturedLayout />);

    // path 요소가 제대로 렌더링되는지 확인
    const pathElements = container.querySelectorAll("path");
    expect(pathElements).toHaveLength(1); // path 요소가 하나만 있어야 합니다.
    expect(pathElements[0]).toHaveAttribute("d"); // path의 "d" 속성 존재 여부 확인
  });
});
