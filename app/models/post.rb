require 'elasticsearch/model'

class Post < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :user, optional: true
  has_many :comments, as: :parent
  has_many :votes, as: :parent
	 validates :title, presence: true, length: { minimum: 5 }

  def vote_total
    self.upvotes + self.downvotes
  end

  def score_total
    self.upvotes - self.downvotes
  end

  def upvotes
    self.votes.where(score: 1).size
  end

  def downvotes
    self.votes.where(score: -1).size
  end

  def comment_count
    Comment.where(post_id:self).size
  end
end

Post.import force: true
