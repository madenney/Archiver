import thumbnail

def main():
    #TODO testing
    print("running tests")

    #test args
    tournamentName = "Half Moon 69"
    roundName = "Grand Finals"
    player1 = "Nash"
    player2 = "Mad Matt"
    chars1 = ["falcon", "link", "marth"]
    chars2 = ["falco"]
    output = "test.png"
    
    thumbnail.generate(tournamentName, roundName, player1, player2, chars1, chars2, output)

    #TODO testing
    print("tests completed")

if __name__=='__main__':
    main()