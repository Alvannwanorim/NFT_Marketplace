//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//Imports
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

//error
error NftMarketPlace__PriceMustBeAboveZero();
error NftMarketPlace__NotApprovedForMarketPlace();
error NftMarketPlace__AlreadyListed(address ntfAddress, uint256 tokenId);
error NftMarketPlace__NotOwner();

contract NftMarketPlace {
  struct Listing {
    uint256 price;
    address seller;
  }

  //NFT Contract Address => NFT TokenId => Listing
  mapping(address => mapping(uint256 => Listing)) private s_listings;

  //Events
  event ItemListed(
    address indexed sender,
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 price
  );

  ////////////////////
  // Modifiers      //
  ////////////////////

  modifier notListed(
    address nftAddress,
    uint256 tokenId,
    address owner
  ) {
    Listing memory listing = s_listings[nftAddress][tokenId];
    if (listing.price > 0) {
      revert NftMarketPlace__AlreadyListed(nftAddress, tokenId);
    }
    _;
  }

  modifier isOwner(
    address nftAddress,
    uint256 tokenId,
    address spender
  ) {
    IERC721 nft = IERC721(nftAddress);
    address owner = nft.ownerOf(tokenId);
    if (spender != owner) {
      revert NftMarketPlace__NotOwner();
    }
    _;
  }

  ////////////////////
  // Main Functions //
  ////////////////////

  function listItem(
    address nftAddress,
    uint256 tokenId,
    uint256 price
  )
    external
    notListed(nftAddress, tokenId, msg.sender)
    isOwner(nftAddress, tokenId, msg.sender)
  {
    if (price < 0) {
      revert NftMarketPlace__PriceMustBeAboveZero();
    }
    // 1. Send the NFT to the contract. Transfer -> Contract "hold" the NFT
    // 2. Owners cann still hold their NFT, and give the marketplace approval
    // to sell the NFT for them.
    IERC721 nft = IERC721(nftAddress);
    if (nft.getApproved(tokenId) != address(this)) {
      revert NftMarketPlace__NotApprovedForMarketPlace();
    }
    s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
    emit ItemListed(msg.sender, nftAddress, tokenId, price);
  }
}
