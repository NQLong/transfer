import com.signature.MyRunner;
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");            MyRunner runner = new MyRunner();

        try {
            runner.testCreateVisibleSignature(true);
        } catch (Exception e) {
            System.out.println(e);
            return;
        }

    }
}