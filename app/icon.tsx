import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const faviconBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACUUlEQVR4AcSXTWhTQRSFz0xMjPhXiNloTEV0467+gBUXuikoGAulVShiQUFw3YVLceWmK+lCUBC0UFoKtYJSVy6kIiqC4KoiTQwqVGhpN4lJ3/SbQpelvBeYvNwzfzDvnHtn5r6JLffKhcTCVf0BYwslXZzr1i6rwI8xyoOSsXpwKK+TwQXgbwrskVOXM7rpBawxENyIQhb0eAGrqHGhFTgnz53zRdVI4aNgZHB8t40iTbEWK6EjsMGHCIuKcTqvjVOFdo12ULOfspo30n02wQjME4h4FRJ2YFJrxWn9LGY0uljV7WJVfSHhNyGOyxmEnP6ihgkMS+jN1wvqID2eK5fU/6ukQVLzjVCwPy7pQG6/BtkHDzkNjyOrp4TkWSjYdFo9EA9DeJ7M1EG9E/ilCQIL6TUID5IWCAIlnZBm8f4shDtAW8zidh5mH26qoBZxABbbQbzpZdNE+tgOAU7+J/2GfBwoQlIo1PkML8P33kUaqTX01gsYYiAIbKRbfPTusPb3llb04tgb/bOd03oeCodnNNY5o8kjLzXX9U7LHADnI6A4z0S/Uu6U0knx2c/lHXDCL8UW0N3QUKWgqaTIFfSk0tDd+V4d9c7EFsDd7QT58kpSQDhgnIYz3EHO1HScPsEIaUZZsm8Ryss4cT2RACNOMm9oxYjCPmvVF1sA2atO0mi2Qu7nchT9H5RCbAFMXiUCrV9eDQsg7Y0tANe/IaLMIuAErdYsFVtApq4PpNFZ9P9FwX/4qSgTWmwBhVktRU09YhONgu/wEhTKLWy74XUAAAD//5JQOcUAAAAGSURBVAMAmNENSxZ9G3cAAAAASUVORK5CYII=";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px",
        }}
      >
        <img
          src={`data:image/png;base64,${faviconBase64}`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
