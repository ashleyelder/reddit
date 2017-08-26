class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :parent, polymorphic: true

  has_many :comments, as: :parent

  validates :body, presence: true,
                   length: { minimum: 1}
  validates :user_id, presence: true
end
