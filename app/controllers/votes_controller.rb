class VotesController < ApplicationController

  def create
    @vote = Vote.new(vote_params)
      if @vote.save
        redirect_to request.referrer
      else
        redirect_to request.referrer
        flash[:notice] = "you already voted"
      end
  end

  private
    def vote_params
      params.require(:vote).permit(:user_id, :parent_type, :parent_id, :score)
    end

end
