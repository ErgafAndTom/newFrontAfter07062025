// ============================================================================
// Message.jsx
// Главный модуль рендера сообщения Telegram (Telegram Desktop style)
// ============================================================================

import React from "react";

import EntitiesText from "./dop/EntitiesText";
import ForwardHeader from "./dop/ForwardHeader";
import ReplyPreview from "./dop/ReplyPreview";
import EditedLabel from "./dop/EditedLabel";
import TimeLabel from "./dop/TimeLabel";
import ReactionBar from "./dop/ReactionBar";
import ServiceMessage from "./dop/ServiceMessage";

// MEDIA COMPONENTS
import PhotoMessage from "./dop/PhotoMessage";
import VideoMessage from "./dop/VideoMessage";
import VoiceMessage from "./dop/VoiceMessage";
import GIFMessage from "./dop/GIFMessage";
import StickerMessage from "./dop/StickerMessage";
import DocumentMessage from "./dop/DocumentMessage";
import WebPageMessage from "./dop/WebPageMessage";
import PollMessage from "./dop/PollMessage";
import LocationMessage from "./dop/LocationMessage";
import ContactMessage from "./dop/ContactMessage";
import AlbumMessage from "./dop/AlbumMessage";

import { preloadMediaForMessages } from "./mediaLoader";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Message({ msg }) {

  console.log(msg);
  if (!msg) return null;

  // SERVICE MESSAGES (join, left, title changed, photo changed...)
  if (msg.mediaType === "service") {
    return <ServiceMessage msg={msg} />;
  }

  const isOut = msg.direction === "out";
  const wrapperStyle = {
    display: "flex",
    justifyContent: isOut ? "flex-end" : "flex-start",
    width: "100%",
    marginBottom: "6px",
    paddingLeft: "8px",
    paddingRight: "8px"
  };

  const bubbleStyle = {
    maxWidth: "72%",
    background: isOut ? "#D1F7C4" : "#FFFFFF",
    borderRadius: 14,
    padding: "7px 10px 4px 10px",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.15)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderTopLeftRadius: isOut ? 14 : 4,
    borderTopRightRadius: isOut ? 4 : 14,
  };

  return (
    <div style={wrapperStyle}>
      <div style={bubbleStyle}>

        {/* Forward */}
        {msg.forward && (
          <ForwardHeader forward={msg.forward} />
        )}

        {/* Reply */}
        {msg.replyTo && (
          <ReplyPreview reply={msg.replyTo} />
        )}

        {/* TEXT */}
        {msg.text && msg.text.trim() !== "" && (
          <EntitiesText
            text={msg.text}
            entities={msg.entities}
          />
        )}

        {/* MEDIA */}
        {renderMedia(msg)}

        {/* REACTIONS */}
        {msg.raw?.rawJson?.reactions && (
          <ReactionBar reactions={msg.raw.rawJson.reactions} />
        )}

        {/* TIME + EDITED */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
            opacity: 0.55,
            fontSize: 11
          }}
        >
          {msg.edited && (
            <EditedLabel time={msg.edited} />
          )}
          {!msg.edited && (
            <>
              {/*<EditedLabel time={msg.date}/>*/}
              <TimeLabel time={msg.date} />
            </>
          )}


        </div>


      </div>
    </div>
  );
}



// ============================================================================
// MEDIA SWITCHER
// ============================================================================

function renderMedia(msg) {
  // ============================================================
  // 1) Групповые медиа (альбомы)
  // ============================================================
  // Если msg.media — массив (несколько медиа в одном сообщении)
  if (Array.isArray(msg.media) && msg.media.length > 1) {
    return <AlbumMessage msg={msg} />;
  }

  // Если Telegram прислал альбом через groupedId,
  // но parseMessage вернул массив медиа (твой парсер может это делать),
  // то обрабатываем так же:
  if (msg.groupedId && Array.isArray(msg.media)) {
    return <AlbumMessage msg={msg} />;
  }

  // ============================================================
  // 2) Один единственный медиа-объект
  // ============================================================
  switch (msg.mediaType) {
    case "photo":
      return <PhotoMessage msg={msg} />;

    case "video":
      return <VideoMessage msg={msg} />;

    case "voice":
      return <VoiceMessage msg={msg} />;

    case "gif":
      return <GIFMessage msg={msg} />;

    case "sticker":
      return <StickerMessage msg={msg} />;

    case "document":
    case "document-image":
      return <DocumentMessage msg={msg} />;

    case "poll":
      return <PollMessage msg={msg} />;

    case "location":
      return <LocationMessage msg={msg} />;

    case "contact":
      return <ContactMessage msg={msg} />;

    case "webpage":
    case "webpage-photo":
    case "webpage-video":
      return <WebPageMessage msg={msg} />;

    default:
      return null;
  }
}

