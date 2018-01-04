class CommentsController < ApplicationController
  before_action :authenticate_logged_in, only: [:new, :create]
  before_action :authenticate_owner, only: [:destroy]
  before_action :find_parent

  def create
    @comment = @parent.comments.new(comment_params)
    @comment.user = current_user
    if @comment.parent_type == "Post"
      @post = Post.find(params[:post_id])
      @comment.post_id = @post.id
    else
      @comment.post_id = @parent.post_id
    end
    if @parent.save && @comment.save
      @vote = Vote.create(user_id: @comment.user_id, parent_type: "Comment", parent_id: @comment.id, score: 1)
      redirect_back(fallback_location: root_path)
    else
      redirect_back(fallback_location: root_path)
      flash[:notice] = "we need something here"
    end
  end

  def update
    @comment = Comment.find(params[:id])
    @comment.update(body: "deleted", user_id: nil)
  end

  private
    def authenticate_logged_in
      unless current_user
        redirect_to root_path
      end
    end

    def authenticate_owner
      @comment = Comment.find(params[:id])
      unless @comment.user == current_user
        redirect_to post_path
      end
    end

    def comment_params
      params[:comment][:user_id] = current_user.id
      params.require(:comment).permit(:body, :user_id, :post_id)
    end

    def find_parent
      @parent = Comment.find_by_id(params[:comment_id]) if params[:comment_id]
      @parent = Post.find_by_id(params[:post_id]) if params[:post_id]
    end
end
