// MessageList.tsx

import React, { useState } from "react";
import { format } from "date-fns";
import {

  CheckCheck,
  SmilePlus,
} from "lucide-react";

import quickReactions from "../../utils/emojies";

import type { Message } from "../../store/useChatStore";

type User = {
  _id: string;
};

type Props = {
  groupedMessages: Record<
    string,
    Message[]
  >;

  user: User | null;

  theme: string;

  renderDateSeparator: (
    date: Date
  ) => React.ReactNode;

  handleReaction: (
    messageId: string,
    emoji: string
  ) => void;

  messageRef: React.RefObject<HTMLDivElement | null>;
};

const MessageList = ({
  groupedMessages,
  user,
  theme,
  renderDateSeparator,
  handleReaction,
  messageRef,
}: Props) => {
  const [hoveredMessage, setHoveredMessage] =
    useState<string | null>(null);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-5 bg-cover bg-center"
      style={{
        backgroundColor:
          theme === "dark"
            ? "#0b141a"
            : "#efeae2",
      }}
    >
      {Object.entries(groupedMessages).map(
        ([date, msgs]) => (
          <div
            key={date}
            className="mb-6"
          >
            {renderDateSeparator(
              new Date(date)
            )}

            <div className="space-y-3">
              {msgs.map((msg) => {
                const isMine =
                  msg.sender?._id === user?._id;

                const isReactionOpen =
                  hoveredMessage === msg._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex relative ${isMine
                      ? "justify-end"
                      : "justify-start"
                      }`}
                    onMouseEnter={() =>
                      setHoveredMessage(msg._id)
                    }
                    onMouseLeave={() =>
                      setHoveredMessage(null)
                    }
                  >
                    <div className="relative max-w-[75%]">
                      {/* REACTION TRIGGER */}
                      {isReactionOpen && (
                        <div
                          className={`absolute top-1 z-30 ${isMine
                            ? "-left-10"
                            : "-right-10"
                            }`}
                        >
                          <div className="relative group/reaction">
                            {/* EMOJI BUTTON */}
                            <button
                              className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition
                ${theme === "dark"
                                  ? "bg-[#202c33] hover:bg-[#2a3942]"
                                  : "bg-white hover:bg-gray-100"
                                }`}
                            >
                              <SmilePlus />
                            </button>

                            {/* QUICK REACTIONS */}
                            <div
                              className={`absolute top-0 ${isMine
                                ? "right-10"
                                : "left-10"
                                }
                hidden group-hover/reaction:flex
                items-center gap-1
                px-2 py-1 rounded-full shadow-2xl border
                ${theme === "dark"
                                  ? "bg-[#202c33] border-[#2f3b43]"
                                  : "bg-white border-gray-200"
                                }`}
                            >
                              {quickReactions.map(
                                (emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() =>
                                      handleReaction(
                                        msg._id,
                                        emoji
                                      )
                                    }
                                    className="hover:scale-125 transition text-lg"
                                  >
                                    {emoji}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MESSAGE */}
                      <div
                        className={`group relative px-3 py-2 rounded-2xl shadow-sm
          ${isMine
                            ? theme === "dark"
                              ? "bg-[#005c4b] text-white rounded-br-md"
                              : "bg-[#d9fdd3] text-black rounded-br-md"
                            : theme === "dark"
                              ? "bg-[#202c33] text-white rounded-bl-md"
                              : "bg-white text-black rounded-bl-md"
                          }`}
                      >
                        {/* IMAGE */}
                        {msg.imageOrVideoUrl && (
                          <img
                            src={msg.imageOrVideoUrl}
                            alt=""
                            className="rounded-xl mb-2 max-h-72 object-cover"
                          />
                        )}

                        {/* TEXT */}
                        {msg.content && (
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}

                        {/* TIME */}
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[10px] opacity-70">
                            {msg.createdAt
                              ? format(
                                new Date(
                                  msg.createdAt
                                ),
                                "hh:mm a"
                              )
                              : ""}
                          </span>

                          {isMine && (
                            <>
                              {msg.messageStatus ===
                                "read" ? (
                                <CheckCheck
                                  size={14}
                                  className="text-blue-400"
                                />
                              ) : (
                                <CheckCheck
                                  size={14}
                                  className="opacity-60"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* REACTION BADGE */}
                      {msg.reactions &&
                        msg.reactions.length > 0 && (
                          <div
                            className={`absolute -bottom-3 z-10 ${isMine
                              ? "right-2"
                              : "left-2"
                              }`}
                          >
                            <div
                              className={`flex items-center gap-1 px-2 py-[2px]
                rounded-full shadow-md text-xs border
                ${theme === "dark"
                                  ? "bg-[#202c33] text-white border-[#2f3b43]"
                                  : "bg-white text-black border-gray-200"
                                }`}
                            >
                              {[
                                ...new Set(
                                  msg.reactions.map(
                                    (r) => r.emoji
                                  )
                                ),
                              ].map((emoji) => (
                                <span key={emoji}>
                                  {emoji}
                                </span>
                              ))}

                              <span className="text-[10px] opacity-70 ml-1">
                                {msg.reactions.length}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      <div ref={messageRef} />
    </div>
  );
};

export default MessageList;