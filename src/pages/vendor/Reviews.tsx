import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MessageCircle, 
  Search, 
  Filter, 
  CornerDownRight, 
  Reply,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Review, useReviewsQuery, useReplyReviewMutation } from '@/api/hooks/review.hooks';

export default function Reviews() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'REPLIED' | 'UNREPLIED'>('ALL');
  
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch reviews using TanStack Query
  const { data, isLoading, isError, error } = useReviewsQuery({
    search: searchQuery,
    rating: filterRating,
    status: filterStatus
  });

  const reviewsList = data?.reviews || [];

  // Mutation for replying
  const replyMutation = useReplyReviewMutation();

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    if (!replyText.trim()) {
      toast({ title: 'Validation Error', description: 'Reply text cannot be empty', variant: 'destructive' });
      return;
    }

    replyMutation.mutate({
      id: replyingReview.id,
      reply: replyText.trim()
    }, {
      onSuccess: () => {
        toast({ title: 'Reply Posted', description: 'Your reply has been successfully published.' });
        setReplyText('');
        setReplyingReview(null);
      },
      onError: (err: Error) => {
        toast({ 
          title: 'Error', 
          description: err.message || 'Failed to post reply.',
          variant: 'destructive'
        });
      }
    });
  };

  // Reviews are already filtered by the backend, but if pagination is off, we use the backend results directly
  const filteredReviews = reviewsList;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Customer Reviews</h1>
          <p className="text-muted-foreground">Monitor and respond to product feedback left by buyers</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-sm font-semibold self-start sm:self-auto">
          <Star className="w-4 h-4 fill-primary" />
          <span>4.7 Average Store Rating</span>
        </div>
      </motion.div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-card border border-border rounded-xl p-4 shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews, products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter Rating:</span>
          </div>
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            {(['ALL', 5, 4, 3, 2] as const).map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(star)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1",
                  filterRating === star 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {star === 'ALL' ? 'All' : (
                  <>
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-current text-warning" />
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="flex bg-muted p-1 rounded-lg border border-border">
            {(['ALL', 'UNREPLIED', 'REPLIED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                  filterStatus === status 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status === 'ALL' ? 'All' : status === 'UNREPLIED' ? 'Pending' : 'Replied'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl shadow-soft">
          <Info className="w-8 h-8 text-primary animate-pulse mb-3" />
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      ) : isError ? (
        <div className="bg-card border border-destructive/20 rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 text-destructive opacity-80" />
          <p className="font-semibold text-lg text-foreground">Failed to load reviews</p>
          <p className="text-sm mt-1 text-destructive/80">{error?.message || "An unexpected error occurred."}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground shadow-soft">
          <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-lg text-foreground">No reviews matched your filters</p>
          <p className="text-sm mt-1">Try resetting your search query or changing filter parameters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 shadow-soft space-y-4 hover:border-primary/20 transition-colors"
            >
              {/* Customer + Product info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{review.customerName}</h4>
                    <p className="text-xs text-muted-foreground">Reviewed: <span className="text-foreground font-medium">{review.productName}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-auto">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-4 h-4",
                          i < review.rating ? "text-warning fill-warning" : "text-muted-foreground/35"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="text-sm text-foreground leading-relaxed pl-1">
                {review.comment}
              </div>

              {/* Reply Section */}
              {review.reply ? (
                <div className="bg-muted/40 border border-border rounded-lg p-4 flex gap-3 items-start pl-4 ml-1">
                  <CornerDownRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Your Response</span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{review.reply}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => {
                      setReplyingReview(review);
                      setReplyText('');
                    }}
                  >
                    <Reply className="w-4 h-4" />
                    Reply to Review
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyingReview} onOpenChange={(open) => !open && setReplyingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {replyingReview?.customerName}'s Review</DialogTitle>
            <DialogDescription className="hidden">Write a response to the customer's review</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border text-xs space-y-2">
              <p className="font-semibold text-foreground">Review Left:</p>
              <p className="text-muted-foreground italic">"{replyingReview?.comment}"</p>
            </div>
            
            <form onSubmit={handlePostReply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-text">Your Response *</Label>
                <Textarea 
                  id="reply-text"
                  placeholder="Thank the customer or address their concern..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setReplyingReview(null)} disabled={replyMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={replyMutation.isPending}>
                  {replyMutation.isPending ? "Publishing..." : "Publish Reply"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
