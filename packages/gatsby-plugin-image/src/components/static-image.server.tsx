import React, { FunctionComponent } from "react"
import { splitProps, StaticImageProps } from "../utils"
import { FluidObject, FixedObject } from "gatsby-image"
import { GatsbyImage as GatsbyImageServer } from "./gatsby-image.server"
import { GatsbyImageProps } from "./gatsby-image.browser"

// These values are added by Babel. Do not add them manually
interface IPrivateProps {
  __imageData?: FluidObject & FixedObject
  __error?: string
}

export function _getStaticImage(
  GatsbyImage: FunctionComponent<GatsbyImageProps>
): React.FC<StaticImageProps & IPrivateProps> {
  return function StaticImage({
    src,
    __imageData: imageData,
    __error,
    ...props
  }): JSX.Element {
    if (__error) {
      console.warn(__error)
    }
    const { gatsbyImageProps, layout } = splitProps({ src, ...props })
    if (imageData) {
      const isResponsive = layout === `responsive`
      const childProps: Pick<
        GatsbyImageProps,
        "layout" | "width" | "height" | "images" | "placeholder"
      > = {
        layout,
        placeholder: null,
        width: isResponsive ? 1 : imageData.width,
        height: isResponsive ? imageData.aspectRatio : imageData.height,
        images: {
          fallback: {
            src: imageData.src,
            srcSet: imageData.srcSet,
          },
          sources: [],
        },
      }

      const placeholder = imageData.tracedSVG || imageData.base64

      if (placeholder) {
        childProps.placeholder = {
          fallback: placeholder,
        }
      }

      if (imageData.srcWebp) {
        childProps.images.sources.push({
          srcSet: imageData.srcSetWebp,
          type: `image/webp`,
        })
      }
      return <GatsbyImage {...gatsbyImageProps} {...childProps} />
    }
    console.warn(`Image not loaded`, src)
    if (!__error && process.env.NODE_ENV === `development`) {
      console.warn(
        `Please ensure that "gatsby-plugin-image" is included in the plugins array in gatsby-config.js`
      )
    }
    return null
  }
}

export const StaticImage: React.FC<
  StaticImageProps & IPrivateProps
> = _getStaticImage(GatsbyImageServer)
