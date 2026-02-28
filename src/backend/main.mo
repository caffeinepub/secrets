import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  let secretStore = Map.empty<Nat, Secret>();
  let commentStore = Map.empty<Nat, List.List<Comment>>();
  var nextSecretId = 1;
  var nextCommentId = 1;

  type ReactionCounts = {
    heart : Nat;
    fire : Nat;
    wow : Nat;
    sad : Nat;
  };

  type Secret = {
    id : Nat;
    text : Text;
    category : Text;
    timestamp : Int;
    reactions : ReactionCounts;
    commentCount : Nat;
  };

  type Comment = {
    id : Nat;
    secretId : Nat;
    text : Text;
    timestamp : Int;
  };

  module Secret {
    public func compare(secret1 : Secret, secret2 : Secret) : Order.Order {
      Int.compare(secret2.timestamp, secret1.timestamp);
    };
  };

  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      Int.compare(comment2.timestamp, comment1.timestamp);
    };
  };

  type TrendingSecret = {
    secret : Secret;
    totalReactions : Nat;
  };

  module TrendingSecret {
    public func compare(ts1 : TrendingSecret, ts2 : TrendingSecret) : Order.Order {
      Nat.compare(ts2.totalReactions, ts1.totalReactions);
    };
  };

  type SecretPreview = {
    id : Nat;
    text : Text;
    commentCount : Nat;
    reactions : ReactionCounts;
  };

  public shared ({ caller }) func submitSecret(text : Text, category : Text, timestamp : Int) : async Nat {
    if (text.size() > 500) {
      Runtime.trap("Text cannot exceed 500 characters");
    };

    let secret : Secret = {
      id = nextSecretId;
      text;
      category;
      timestamp;
      reactions = { heart = 0; fire = 0; wow = 0; sad = 0 };
      commentCount = 0;
    };

    secretStore.add(nextSecretId, secret);
    let emptyComments = List.empty<Comment>();
    commentStore.add(nextSecretId, emptyComments);

    nextSecretId += 1;
    secret.id;
  };

  public query ({ caller }) func getSecrets(filter : Text, page : Nat) : async [SecretPreview] {
    let secrets = secretStore.values().toArray();
    let sortedSecrets = secrets.sort();

    var pagedSecrets = sortedSecrets;

    if (filter == "trending") {
      let trendingSecrets = sortedSecrets.map(
        func(secret) {
          let totalReactions = secret.reactions.heart + secret.reactions.fire + secret.reactions.wow + secret.reactions.sad;
          { secret; totalReactions };
        }
      );
      let sortedTrending = trendingSecrets.sort();
      pagedSecrets := sortedTrending.map(func(ts) { ts.secret });
    };

    let start = page * 10;
    let end = Nat.min(start + 10, pagedSecrets.size());

    if (start >= pagedSecrets.size()) {
      return [];
    };

    pagedSecrets.sliceToArray(start, end).map(
      func(secret) {
        {
          id = secret.id;
          text = secret.text;
          commentCount = secret.commentCount;
          reactions = secret.reactions;
        };
      }
    );
  };

  public query ({ caller }) func getSecret(id : Nat) : async Secret {
    switch (secretStore.get(id)) {
      case (null) { Runtime.trap("Secret not found") };
      case (?secret) { secret };
    };
  };

  public shared ({ caller }) func reactToSecret(id : Nat, reactionType : Text) : async ReactionCounts {
    switch (secretStore.get(id)) {
      case (null) { Runtime.trap("Secret not found") };
      case (?secret) {
        let updatedReactions = switch (reactionType) {
          case ("heart") {
            {
              heart = secret.reactions.heart + 1;
              fire = secret.reactions.fire;
              wow = secret.reactions.wow;
              sad = secret.reactions.sad;
            };
          };
          case ("fire") {
            {
              heart = secret.reactions.heart;
              fire = secret.reactions.fire + 1;
              wow = secret.reactions.wow;
              sad = secret.reactions.sad;
            };
          };
          case ("wow") {
            {
              heart = secret.reactions.heart;
              fire = secret.reactions.fire;
              wow = secret.reactions.wow + 1;
              sad = secret.reactions.sad;
            };
          };
          case ("sad") {
            {
              heart = secret.reactions.heart;
              fire = secret.reactions.fire;
              wow = secret.reactions.wow;
              sad = secret.reactions.sad + 1;
            };
          };
          case (_) {
            Runtime.trap("Invalid reaction type");
          };
        };
        let updatedSecret : Secret = {
          id = secret.id;
          text = secret.text;
          category = secret.category;
          timestamp = secret.timestamp;
          reactions = updatedReactions;
          commentCount = secret.commentCount;
        };
        secretStore.add(id, updatedSecret);
        updatedReactions;
      };
    };
  };

  public shared ({ caller }) func addComment(secretId : Nat, text : Text, timestamp : Int) : async Nat {
    switch (secretStore.get(secretId)) {
      case (null) { Runtime.trap("Secret not found") };
      case (?secret) {
        let comment : Comment = {
          id = nextCommentId;
          secretId;
          text;
          timestamp;
        };

        switch (commentStore.get(secretId)) {
          case (null) {
            let newComments = List.empty<Comment>();
            newComments.add(comment);
            commentStore.add(secretId, newComments);
          };
          case (?comments) {
            comments.add(comment);
          };
        };

        let updatedCommentCount = switch (commentStore.get(secretId)) {
          case (null) { 0 };
          case (?comments) { comments.size() };
        };

        let updatedSecret : Secret = {
          id = secret.id;
          text = secret.text;
          category = secret.category;
          timestamp = secret.timestamp;
          reactions = secret.reactions;
          commentCount = updatedCommentCount;
        };
        secretStore.add(secretId, updatedSecret);

        nextCommentId += 1;
        comment.id;
      };
    };
  };

  public query ({ caller }) func getComments(secretId : Nat) : async [Comment] {
    switch (commentStore.get(secretId)) {
      case (null) { [] };
      case (?comments) {
        comments.toArray().sort();
      };
    };
  };
};
