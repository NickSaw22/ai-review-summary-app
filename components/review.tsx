"use client";
 
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Review as ReviewType } from "@/lib/types";
import ms from "ms";
import { FiveStarRating } from "./five-star-rating";
 
export function Review({ review }: { review: ReviewType }) {
  const date = new Date(review.date);
 
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback>{getInitials(review.reviewer)}</AvatarFallback>
      </Avatar>
 
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{review.reviewer}</p>
            <div className="flex items-center gap-2 mt-1">
              <FiveStarRating rating={review.stars} />
              <time className="text-xs text-muted-foreground" suppressHydrationWarning>
                {timeAgo(date)}
              </time>
            </div>
          </div>
        </div>
 
        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.review}
        </p>
      </div>
    </div>
  );
}
 
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
 
function timeAgo(date: Date, suffix = true): string {
  const now = Date.now();
  const diff = now - date.getTime();
 
  if (diff < 1000) {
    return "Just now";
  }
 
  return `${ms(diff, { long: true })}${suffix ? " ago" : ""}`;
}