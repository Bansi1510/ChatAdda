// MessageList.tsx

import React from "react";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import quickReactions from "../../utils/emojies";
import type { Message } from "../../store/useChatStore";

type User = {
  _id: string;
};

type Props = {
  groupedMessages: Record<string, Message[]>;
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
  console.log(groupedMessages)
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

          <div key={date}>
            {renderDateSeparator(new Date(date))}

            <div className="space-y-4">
              {msgs.map((msg) => {
                const isMine =
                  msg.sender?._id === user?._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex relative ${isMine
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    {/* MESSAGE WRAPPER */}
                    <div className="relative max-w-[75%]">
                      {/* MESSAGE BUBBLE */}
                      <div
                        className={`group relative px-3 py-2 rounded-lg shadow-sm
                        ${isMine
                            ? theme === "dark"
                              ? "bg-[#005c4b] text-white rounded-br-none"
                              : "bg-[#d9fdd3] text-black rounded-br-none"
                            : theme === "dark"
                              ? "bg-[#202c33] text-white rounded-bl-none"
                              : "bg-white text-black rounded-bl-none"
                          }`}
                      >
                        {/* IMAGE */}
                        {msg.imageOrVideoUrl && (
                          <img
                            src={msg.imageOrVideoUrl}
                            alt=""
                            className="rounded-lg mb-2 max-h-72 object-cover"
                          />
                        )}

                        {/* TEXT */}
                        {msg.content && (
                          <p className="text-sm break-words">
                            {msg.content}
                          </p>
                        )}

                        {/* QUICK REACTIONS */}
                        <div className="flex gap-1 mt-2">
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
                                className="opacity-0 group-hover:opacity-100 transition text-xs hover:scale-125"
                              >
                                {emoji}
                              </button>
                            )
                          )}
                        </div>

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

                      {/* WHATSAPP STYLE REACTIONS */}
                      {msg.reactions &&
                        msg.reactions.length >
                        0 && (
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
                                    (r) =>
                                      r.emoji
                                  )
                                ),
                              ].map((emoji) => (
                                <span key={emoji}>
                                  {emoji}
                                </span>
                              ))}

                              <span className="text-[10px] opacity-70 ml-1">
                                {
                                  msg.reactions
                                    .length
                                }
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